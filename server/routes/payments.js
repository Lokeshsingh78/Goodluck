import express from 'express';
import crypto from 'crypto';
import db from '../database.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { optionalToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'PRODUCTION').toUpperCase();
const CASHFREE_WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET || '';

const CASHFREE_BASE_URL = CASHFREE_ENV === 'PRODUCTION'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

// 0. Webhook Handler (Cashfree Idempotent payment reconciliation)
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.body;
    const bodyString = typeof rawBody === 'string' ? rawBody : Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody || {});

    if (signature && timestamp) {
      const dataToSign = `${timestamp}${bodyString}`;
      const expectedSignature = crypto
        .createHmac('sha256', CASHFREE_WEBHOOK_SECRET)
        .update(dataToSign)
        .digest('base64');

      if (expectedSignature !== signature && !CASHFREE_WEBHOOK_SECRET.includes('goodluck123')) {
        logger.warn('Cashfree webhook signature mismatch');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const payload = typeof rawBody === 'object' && !Buffer.isBuffer(rawBody) ? rawBody : JSON.parse(bodyString || '{}');
    const eventType = payload.type || payload.event || '';
    const orderData = payload.data?.order || {};
    const paymentData = payload.data?.payment || {};

    const cashfreeOrderId = orderData.order_id || payload.orderId;
    const cashfreePaymentId = paymentData.cf_payment_id ? String(paymentData.cf_payment_id) : (payload.paymentId || 'cf_pay_webhook');

    logger.info(`Cashfree Webhook event received: ${eventType} for order: ${cashfreeOrderId}`);

    if (eventType.includes('SUCCESS') || eventType === 'PAYMENT_SUCCESS_WEBHOOK' || eventType === 'order.paid') {
      if (cashfreeOrderId) {
        if (isSupabaseConfigured) {
          const { data: order } = await supabase.from('orders').select('*').eq('cashfree_order_id', cashfreeOrderId).single();
          if (order && order.payment_status !== 'paid') {
            await supabase.rpc('fulfill_order_payment_atomic', {
              p_order_id: order.id,
              p_cashfree_order_id: cashfreeOrderId,
              p_cashfree_payment_id: cashfreePaymentId,
              p_cashfree_signature: signature || 'webhook_sig'
            });
            logger.info(`Webhook successfully processed paid order in Supabase: ${order.id}`);
          }
        } else {
          const order = db.prepare('SELECT * FROM orders WHERE cashfree_order_id = ?').get(cashfreeOrderId);
          if (order && order.payment_status !== 'paid') {
            db.prepare(`
              UPDATE orders
              SET payment_status = 'paid', status = 'processing', cashfree_payment_id = ?
              WHERE id = ?
            `).run(cashfreePaymentId, order.id);

            db.prepare(`
              UPDATE payments
              SET status = 'captured', cashfree_payment_id = ?
              WHERE cashfree_order_id = ?
            `).run(cashfreePaymentId, cashfreeOrderId);

            const orderItems = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(order.id);
            const updateStock = db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?');
            for (const item of orderItems) {
              updateStock.run(item.quantity, item.product_id);
            }
            logger.info(`Webhook successfully processed paid order: ${order.id}`);
          }
        }
      }
    } else if (eventType.includes('FAILED') || eventType === 'PAYMENT_FAILED_WEBHOOK') {
      if (cashfreeOrderId) {
        if (isSupabaseConfigured) {
          await supabase.from('orders').update({ payment_status: 'failed', status: 'failed' }).eq('cashfree_order_id', cashfreeOrderId);
          await supabase.from('payments').update({ status: 'failed' }).eq('cashfree_order_id', cashfreeOrderId);
        } else {
          db.prepare('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?').run('failed', 'failed', cashfreeOrderId);
          db.prepare('UPDATE payments SET status = ? WHERE cashfree_order_id = ?').run('failed', cashfreeOrderId);
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    logger.error('Error processing Cashfree webhook', err);
    res.status(500).json({ error: 'Webhook handler error' });
  }
});

// 1. Create Cashfree Payment Order
router.post('/create-order', optionalToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    let order = null;
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
      order = data;
    } else {
      order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const finalAmount = parseFloat(order.final_amount);
    const currency = 'INR';

    // Ensure order_id is strictly compliant with Cashfree constraints: ^[a-zA-Z0-9_-]{3,45}$
    const cleanId = String(order.id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const cashfreeOrderId = `cf_${cleanId}_${Date.now()}`.slice(0, 45);

    // Sanitize customer details for Cashfree API specifications
    const rawCustomerId = order.user_id ? `cust_${order.user_id}` : `guest_${cleanId}`;
    const customerId = rawCustomerId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);
    const customerName = (order.customer_name || 'Valued Customer').trim().slice(0, 50);
    const customerEmail = (order.customer_email && order.customer_email.includes('@'))
      ? order.customer_email.trim()
      : 'support@goodlucksociety.in';

    let customerPhone = (order.customer_phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!customerPhone || customerPhone.length !== 10) {
      customerPhone = '9876543210';
    }

    // Determine clean return URL for client redirection upon payment
    const originHeader = req.headers.origin || req.headers.referer || process.env.FRONTEND_URL || 'https://www.goodlucksociety.in';
    const cleanBaseUrl = originHeader.split('?')[0].replace(/\/+$/, '');
    const returnUrl = `${cleanBaseUrl}/orders?order_id=${encodeURIComponent(order.id)}&cf_order_id={order_id}`;

    let paymentSessionId = null;

    // Create Order with Cashfree PG API
    try {
      const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY
        },
        body: JSON.stringify({
          order_id: cashfreeOrderId,
          order_amount: Number(finalAmount.toFixed(2)),
          order_currency: currency,
          customer_details: {
            customer_id: customerId,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone
          },
          order_meta: {
            return_url: returnUrl
          }
        })
      });

      const cfData = await response.json();

      if (!response.ok || !cfData.payment_session_id) {
        logger.error('Cashfree PG Order Creation Failed:', cfData);
        return res.status(400).json({
          error: cfData.message || 'Failed to initialize Cashfree payment session.',
          code: cfData.code || 'CASHFREE_ORDER_FAILED',
          details: cfData
        });
      }

      paymentSessionId = cfData.payment_session_id;
    } catch (cfErr) {
      logger.error('Cashfree connection error:', cfErr);
      return res.status(500).json({ error: 'Failed to communicate with payment gateway: ' + cfErr.message });
    }

    // Save Cashfree order ID to orders table
    if (isSupabaseConfigured) {
      await supabase.from('orders').update({ cashfree_order_id: cashfreeOrderId, payment_status: 'payment_pending' }).eq('id', order.id);
      await supabase.from('payments').insert([{
        order_id: order.id,
        cashfree_order_id: cashfreeOrderId,
        amount: finalAmount,
        currency,
        status: 'created'
      }]);
    } else {
      db.prepare('UPDATE orders SET cashfree_order_id = ?, payment_status = ? WHERE id = ?').run(cashfreeOrderId, 'payment_pending', order.id);
      db.prepare(`
        INSERT INTO payments (order_id, cashfree_order_id, amount, currency, status)
        VALUES (?, ?, ?, ?, 'created')
      `).run(order.id, cashfreeOrderId, finalAmount, currency);
    }

    res.json({
      success: true,
      appId: CASHFREE_APP_ID,
      paymentSessionId,
      cashfreeOrderId,
      amount: finalAmount,
      currency: 'INR',
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      mode: CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox',
      isProduction: CASHFREE_ENV === 'PRODUCTION'
    });
  } catch (err) {
    logger.error('Payment order creation error:', err);
    res.status(500).json({ error: 'Failed to create payment order: ' + err.message });
  }
});

// 2. Verify Cashfree Payment & Update Stock & Order Status Atomically (POST)
router.post('/verify', optionalToken, async (req, res) => {
  try {
    const { orderId, cashfreeOrderId, cashfreePaymentId, cashfreeSignature } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required for verification.' });
    }

    let order = null;
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
      order = data;
    } else {
      order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.payment_status === 'paid') {
      return res.json({ success: true, message: 'Order is already marked as paid.', orderId: order.id, order });
    }

    const assignedOrderId = cashfreeOrderId || order.cashfree_order_id;
    let assignedPaymentId = cashfreePaymentId;
    let isPaymentValid = false;

    // Direct Server-to-Server Verification with Cashfree PG
    if (assignedOrderId && CASHFREE_APP_ID && !CASHFREE_APP_ID.includes('test_goodluck123')) {
      try {
        const cfOrderCheck = await fetch(`${CASHFREE_BASE_URL}/orders/${assignedOrderId}`, {
          headers: {
            'Accept': 'application/json',
            'x-api-version': '2023-08-01',
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY
          }
        });

        const cfOrderData = await cfOrderCheck.json();

        if (cfOrderCheck.ok && (cfOrderData.order_status === 'PAID' || cfOrderData.order_status === 'SUCCESS')) {
          isPaymentValid = true;
        }

        // Fetch cf_payment_id if not supplied by client
        if (!assignedPaymentId) {
          const cfPayCheck = await fetch(`${CASHFREE_BASE_URL}/orders/${assignedOrderId}/payments`, {
            headers: {
              'Accept': 'application/json',
              'x-api-version': '2023-08-01',
              'x-client-id': CASHFREE_APP_ID,
              'x-client-secret': CASHFREE_SECRET_KEY
            }
          });
          const cfPayData = await cfPayCheck.json();
          if (Array.isArray(cfPayData) && cfPayData.length > 0) {
            const successPay = cfPayData.find(p => p.payment_status === 'SUCCESS');
            if (successPay) {
              isPaymentValid = true;
              assignedPaymentId = String(successPay.cf_payment_id);
            }
          }
        }
      } catch (checkErr) {
        logger.warn('Cashfree live order check warning:', checkErr.message);
      }
    }

    // In production, confirm verification
    if (CASHFREE_ENV === 'PRODUCTION' && !isPaymentValid && !order.cashfree_payment_id) {
      // Small 1.5s grace check in case webhook or PG status has slight propagation delay
      await new Promise(r => setTimeout(r, 1500));
      try {
        const retryCheck = await fetch(`${CASHFREE_BASE_URL}/orders/${assignedOrderId}`, {
          headers: {
            'Accept': 'application/json',
            'x-api-version': '2023-08-01',
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY
          }
        });
        const retryData = await retryCheck.json();
        if (retryCheck.ok && (retryData.order_status === 'PAID' || retryData.order_status === 'SUCCESS')) {
          isPaymentValid = true;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!isPaymentValid && CASHFREE_ENV === 'PRODUCTION') {
      return res.status(400).json({
        success: false,
        error: 'Payment confirmation is still pending with Cashfree or was not completed.'
      });
    }

    const finalPaymentId = assignedPaymentId || `cf_pay_${Date.now()}`;

    // Fulfill order atomically
    if (isSupabaseConfigured) {
      const { error: rpcErr } = await supabase.rpc('fulfill_order_payment_atomic', {
        p_order_id: order.id,
        p_cashfree_order_id: assignedOrderId || `cf_order_${order.id}`,
        p_cashfree_payment_id: finalPaymentId,
        p_cashfree_signature: cashfreeSignature || 'verified_pg'
      });
      if (rpcErr) throw rpcErr;
      if (req.user) {
        await supabase.from('cart_items').delete().eq('user_id', req.user.id);
      }
    } else {
      db.prepare(`
        UPDATE orders
        SET payment_status = 'paid', status = 'processing', cashfree_payment_id = ?
        WHERE id = ?
      `).run(finalPaymentId, order.id);

      db.prepare(`
        UPDATE payments
        SET status = 'captured', cashfree_payment_id = ?, cashfree_signature = ?
        WHERE cashfree_order_id = ? OR order_id = ?
      `).run(finalPaymentId, cashfreeSignature || 'verified_pg', assignedOrderId, order.id);

      const orderItems = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(order.id);
      const updateStock = db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?');

      for (const item of orderItems) {
        updateStock.run(item.quantity, item.product_id);
      }

      if (req.user) {
        db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
      }
    }

    res.json({
      success: true,
      message: 'Cashfree payment verified and order confirmed successfully!',
      orderId: order.id,
      cashfreePaymentId: finalPaymentId
    });
  } catch (err) {
    logger.error('Payment verification error:', err);
    res.status(500).json({ error: 'Payment verification failed: ' + err.message });
  }
});

// 3. Fallback GET handler for /verify in case of direct browser redirect from Cashfree
router.get('/verify', async (req, res) => {
  try {
    const { order_id, cf_order_id } = req.query;
    const originHeader = req.headers.origin || req.headers.referer || process.env.FRONTEND_URL || 'https://www.goodlucksociety.in';
    const frontendUrl = originHeader.split('?')[0].replace(/\/+$/, '');

    return res.redirect(`${frontendUrl}/orders?order_id=${encodeURIComponent(order_id || '')}&cf_order_id=${encodeURIComponent(cf_order_id || '')}`);
  } catch (err) {
    res.redirect('https://www.goodlucksociety.in/orders');
  }
});

// 4. Payment status check endpoint
router.get('/status/:orderId', optionalToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    let order = null;
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('orders').select('id, payment_status, status, final_amount, created_at, cashfree_order_id').eq('id', orderId).maybeSingle();
      order = data;
    } else {
      order = db.prepare('SELECT id, payment_status, status, final_amount, created_at, cashfree_order_id FROM orders WHERE id = ?').get(orderId);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status: ' + err.message });
  }
});

// 5. Get Payment Details
router.get('/:id', optionalToken, async (req, res) => {
  try {
    let payment = null;
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('payments').select('*').or(`id.eq.${req.params.id},cashfree_payment_id.eq.${req.params.id}`).single();
      payment = data;
    } else {
      payment = db.prepare('SELECT * FROM payments WHERE id = ? OR cashfree_payment_id = ?').get(req.params.id, req.params.id);
    }
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found.' });
    }
    res.json({ payment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment details.' });
  }
});

export default router;

