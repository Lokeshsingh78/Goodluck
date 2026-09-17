import express from 'express';
import db from '../database.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { verifyToken, optionalToken } from '../middleware/auth.js';

const router = express.Router();

// Create Order (Calculates prices securely on backend)
router.post('/create', optionalToken, async (req, res) => {
  try {
    const { items, customerName, customerEmail, customerPhone, shippingAddress, discountCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      return res.status(400).json({ error: 'Customer contact and shipping details are required.' });
    }

    let subtotal = 0;
    const validatedItems = [];

    if (isSupabaseConfigured) {
      for (const item of items) {
        const { data: product } = await supabase.from('products').select('id, name, price, stock, is_active').eq('id', item.id).single();
        if (!product || product.is_active === false) {
          return res.status(400).json({ error: `Product "${item.name || item.id}" is no longer available.` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for product "${product.name}". Available: ${product.stock}` });
        }

        const price = parseFloat(product.price);
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        validatedItems.push({
          productId: product.id,
          productName: product.name,
          price,
          quantity: item.quantity,
          size: item.size || 'M'
        });
      }
    } else {
      for (const item of items) {
        const product = db.prepare('SELECT id, name, price, stock, is_active FROM products WHERE id = ?').get(item.id);
        if (!product || product.is_active === 0) {
          return res.status(400).json({ error: `Product "${item.name || item.id}" is no longer available.` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for product "${product.name}". Available: ${product.stock}` });
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        validatedItems.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          size: item.size || 'M'
        });
      }
    }

    // Apply valid discount server-side only
    let discountAmount = 0;
    if (discountCode && discountCode.trim().toUpperCase() === 'SAFE10') {
      discountAmount = subtotal * 0.10;
    }

    const shippingFee = subtotal >= 999.00 ? 0 : 99.00;
    const finalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = req.user ? req.user.id : null;

    if (isSupabaseConfigured) {
      const { error: orderErr } = await supabase.from('orders').insert([{
        id: orderId,
        user_id: userId,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        shipping_address: shippingAddress.trim(),
        subtotal,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        final_amount: finalAmount,
        status: 'pending',
        payment_status: 'pending'
      }]);
      if (orderErr) throw orderErr;

      const dbOrderItems = validatedItems.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        price: item.price,
        quantity: item.quantity,
        size: item.size
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(dbOrderItems);
      if (itemsErr) throw itemsErr;
    } else {
      db.prepare(`
        INSERT INTO orders (
          id, user_id, customer_name, customer_email, customer_phone, shipping_address,
          subtotal, discount_amount, shipping_fee, final_amount, status, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
      `).run(
        orderId, userId, customerName.trim(), customerEmail.trim(), customerPhone.trim(), shippingAddress.trim(),
        subtotal, discountAmount, shippingFee, finalAmount
      );

      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const item of validatedItems) {
        insertItem.run(orderId, item.productId, item.productName, item.price, item.quantity, item.size);
      }
    }

    res.status(201).json({
      message: 'Order created successfully.',
      order: {
        id: orderId,
        subtotal,
        discountAmount,
        shippingFee,
        finalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        items: validatedItems
      }
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order: ' + err.message });
  }
});

// Get user orders
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const result = (orders || []).map(ord => ({
        ...ord,
        items: ord.order_items || []
      }));

      return res.json({ orders: result });
    } else {
      const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
      const result = orders.map((ord) => {
        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
        return { ...ord, items };
      });
      return res.json({ orders: result });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user orders.' });
  }
});

// Get single order detail
router.get('/:id', optionalToken, async (req, res) => {
  try {
    let order = null;
    let items = [];
    let payment = null;

    if (isSupabaseConfigured) {
      const { data: ordData } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
      order = ordData;
      if (order) {
        const { data: itemRows } = await supabase.from('order_items').select('*').eq('order_id', order.id);
        items = itemRows || [];
        const { data: payRows } = await supabase.from('payments').select('*').eq('order_id', order.id).order('created_at', { ascending: false }).limit(1);
        payment = (payRows && payRows[0]) || null;
      }
    } else {
      order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
      if (order) {
        items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
        payment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1').get(order.id);
      }
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Security check: if order belongs to a user, check permission
    if (order.user_id && (!req.user || (req.user.id !== order.user_id && req.user.role !== 'admin'))) {
      return res.status(403).json({ error: 'Forbidden. You do not have access to view this order.' });
    }

    res.json({
      order: {
        ...order,
        items,
        payment
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details.' });
  }
});

export default router;
