import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ArrowLeft,
  Home,
  Lock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Navigation,
  CreditCard,
  Check,
  Tag,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getApiUrl } from '../config/api';

export const CheckoutPage = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    cartGrandTotal,
    formatPrice,
    showToast,
    user,
    userToken,
    navigateTo,
    setIsAuthOpen
  } = useShop();

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [streetAddress, setStreetAddress] = useState(user?.address || '');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cashfree'); // 'cashfree' | 'cod'

  const [discountInput, setDiscountInput] = useState('');
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Sync user profile when available
  useEffect(() => {
    if (user) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!streetAddress && user.address) setStreetAddress(user.address);
    }
  }, [user]);

  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const FREE_SHIPPING_THRESHOLD = 999.0;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const shippingFee = cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99.0;
  const finalTotal = cartGrandTotal + shippingFee;

  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault();
    if (!discountInput.trim()) {
      showToast('Please enter a coupon code.');
      return;
    }
    const res = applyCoupon(discountInput);
    if (res?.error) {
      showToast(res.error);
    } else {
      setDiscountInput('');
    }
  };

  // Dynamically load Cashfree SDK
  const loadCashfreeScript = () => {
    return new Promise((resolve) => {
      if (window.Cashfree) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Complete Payment Workflow
  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !streetAddress.trim()) {
      showToast('Please fill in all required contact and delivery details.');
      return;
    }

    const fullShippingAddress = [
      streetAddress.trim(),
      city.trim(),
      stateRegion.trim(),
      pincode.trim() ? `PIN: ${pincode.trim()}` : ''
    ].filter(Boolean).join(', ');

    setLoadingPayment(true);

    try {
      // 1. Create Backend Order
      const orderRes = await fetch(getApiUrl('/api/orders/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
        },
        body: JSON.stringify({
          items: cart,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          shippingAddress: fullShippingAddress,
          discountCode: appliedCoupon?.code || null,
          paymentMethod
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        showToast(orderData.error || 'Failed to create order.');
        setLoadingPayment(false);
        return;
      }

      const orderId = orderData.order.id;

      // If Cash on Delivery chosen
      if (paymentMethod === 'cod') {
        clearCart();
        setLoadingPayment(false);
        showToast('🎉 Order Placed Successfully via Cash on Delivery!');
        setConfirmedOrder({
          orderId,
          customerName,
          customerEmail,
          paymentMethod: 'Cash on Delivery',
          total: finalTotal
        });
        return;
      }

      // 2. Create Cashfree Payment Order
      const payRes = await fetch(getApiUrl('/api/payments/create-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
        },
        body: JSON.stringify({ orderId })
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.paymentSessionId) {
        showToast(payData.error || 'Failed to initialize payment gateway.');
        setLoadingPayment(false);
        return;
      }

      // 3. Load Cashfree SDK
      const sdkLoaded = await loadCashfreeScript();

      if (!sdkLoaded || !window.Cashfree) {
        showToast('Cashfree SDK could not be loaded. Please check your internet connection.');
        setLoadingPayment(false);
        return;
      }

      // 4. Open Cashfree Checkout Modal with Correct Environment Mode
      try {
        const cashfreeMode = payData.mode || (payData.isProduction ? 'production' : (payData.appId?.includes('test') ? 'sandbox' : 'production'));
        const cashfree = window.Cashfree({ mode: cashfreeMode });

        cashfree.checkout({
          paymentSessionId: payData.paymentSessionId,
          redirectTarget: '_modal'
        }).then(async (result) => {
          if (result.error) {
            console.warn('Cashfree payment notice:', result.error);
            showToast(result.error.message || 'Payment was cancelled or could not be completed.');
            setLoadingPayment(false);
            return;
          }
          if (result.redirect) {
            console.log('Cashfree redirecting customer to payment portal...');
            return;
          }
          if (result.paymentDetails) {
            console.log('Payment processed by Cashfree, verifying on server...', result.paymentDetails);
            await verifyBackendPayment(
              orderId,
              payData.cashfreeOrderId,
              result.paymentDetails.cf_payment_id || null,
              'cashfree_modal_completed'
            );
          }
        }).catch((cfModalErr) => {
          console.warn('Cashfree modal dismiss:', cfModalErr);
          setLoadingPayment(false);
          showToast('Payment window closed or interrupted.');
        });

      } catch (cfInitErr) {
        console.error('Cashfree initialization error:', cfInitErr);
        setLoadingPayment(false);
        showToast('Could not open payment window. Please try again.');
      }

    } catch (err) {
      console.error('Payment Error:', err);
      showToast('An error occurred during payment processing.');
      setLoadingPayment(false);
    }
  };

  // Verify Payment on Backend
  const verifyBackendPayment = async (orderId, cashfreeOrderId, cashfreePaymentId, cashfreeSignature) => {
    try {
      const res = await fetch(getApiUrl('/api/payments/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
        },
        body: JSON.stringify({
          orderId,
          cashfreeOrderId,
          cashfreePaymentId,
          cashfreeSignature
        })
      });

      const data = await res.json();
      setLoadingPayment(false);

      if (res.ok && data.success) {
        clearCart();
        showToast('🎉 Payment Successful! Your order has been confirmed.');
        setConfirmedOrder({
          orderId,
          cashfreePaymentId: data.cashfreePaymentId || cashfreePaymentId,
          customerName,
          customerEmail,
          paymentMethod: 'Cashfree Secure Payment',
          total: finalTotal
        });
      } else {
        showToast(data.error || 'Payment verification failed.');
      }
    } catch (err) {
      setLoadingPayment(false);
      showToast('Network error verifying payment.');
    }
  };

  // Order Confirmation Success View
  if (confirmedOrder) {
    return (
      <div className="section container" style={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(22, 163, 74, 0.15)' }}>
          <CheckCircle2 size={48} />
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#16a34a', marginBottom: '0.4rem' }}>
          Payment Verified & Confirmed
        </span>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
          ORDER CONFIRMED!
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '520px', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Thank you for choosing Good Luck Society. Your order has been confirmed and is now being processed for delivery.
        </p>

        <div style={{ background: '#f9f9f9', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem 2rem', width: '100%', maxWidth: '480px', textAlign: 'left', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
            <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{confirmedOrder.orderId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
            <strong>{confirmedOrder.paymentMethod || 'Cashfree Secure Online'}</strong>
          </div>
          {confirmedOrder.cashfreePaymentId && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cashfree Payment ID:</span>
              <strong style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{confirmedOrder.cashfreePaymentId}</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
            <strong>{confirmedOrder.customerName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', fontSize: '1.1rem' }}>
            <span>Total Paid:</span>
            <strong style={{ color: '#000000' }}>{formatPrice(confirmedOrder.total)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn-primary btn-dark"
            onClick={() => navigateTo('home')}
            style={{ padding: '0.9rem 2.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <Home size={18} /> BACK TO HOME
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigateTo('catalog')}
            style={{ padding: '0.9rem 2rem', fontWeight: 700 }}
          >
            CONTINUE SHOPPING
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigateTo('orders')}
            style={{ padding: '0.9rem 2rem', fontWeight: 700 }}
          >
            VIEW MY ACCOUNT
          </button>
        </div>
      </div>
    );
  }

  // If cart is empty, render empty state
  if (cart.length === 0) {
    return (
      <div className="section container" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <ShoppingBag size={36} style={{ color: 'var(--text-light)' }} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          YOUR CHECKOUT BAG IS EMPTY
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Looks like you haven't added any statement streetwear pieces to your cart yet. Browse our signature oversized catalog!
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn-primary btn-dark"
            onClick={() => navigateTo('home')}
            style={{ padding: '0.9rem 2.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 700 }}
          >
            <Home size={18} /> BACK TO HOME
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigateTo('catalog')}
            style={{ padding: '0.9rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 700 }}
          >
            <ArrowLeft size={18} /> DISCOVER CATALOG
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section container" style={{ minHeight: '85vh', paddingBottom: '4rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <button onClick={() => navigateTo('home')} style={{ color: 'var(--text-light)', cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}>
          HOME
        </button>
        <span>/</span>
        <button onClick={() => navigateTo('catalog')} style={{ color: 'var(--text-light)', cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}>
          SHOP
        </button>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>CHECKOUT</span>
      </div>

      {/* Main Title Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '1.25rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lock size={13} /> SECURE 256-BIT ENCRYPTED CHECKOUT
          </span>
          <h1 className="section-title" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, textTransform: 'uppercase' }}>
            PROCEED TO CHECKOUT
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigateTo('home')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: '0.4rem 0.6rem',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#000000';
              e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'none';
            }}
          >
            <Home size={15} /> BACK TO HOME
          </button>

          <span style={{ color: 'var(--border-color)', height: '14px', width: '1px', background: 'var(--border-color)' }}></span>

          <button
            type="button"
            onClick={() => navigateTo('catalog')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: '0.4rem 0.6rem',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#000000';
              e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'none';
            }}
          >
            <ArrowLeft size={16} /> CONTINUE SHOPPING
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Checkout Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}
      >
        {/* LEFT COLUMN: Shipping & Customer Details Form */}
        <div>
          <form id="checkout-main-form" onSubmit={handleProceedToPayment}>
            {/* User Auth Status Header */}
            {!user ? (
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                    Have an account?
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Sign in for a faster checkout & saved address
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#000000',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  SIGN IN
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1.25rem',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
                  Logged in as <strong>{user.email}</strong>
                </span>
              </div>
            )}

            {/* STEP 1: CONTACT INFORMATION */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                  1
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-family)' }}>
                  CONTACT INFORMATION
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    FULL NAME *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'var(--font-family)',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    EMAIL ADDRESS *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'var(--font-family)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    PHONE NUMBER *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'var(--font-family)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: SHIPPING ADDRESS */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                  2
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-family)' }}>
                  DELIVERY ADDRESS
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    STREET ADDRESS / HOUSE NO / LANDMARK *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-light)' }} />
                    <textarea
                      required
                      rows={3}
                      placeholder="Flat/House No., Building Name, Street Name, Landmark"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.88rem',
                        outline: 'none',
                        fontFamily: 'var(--font-family)',
                        resize: 'none',
                        lineHeight: 1.5
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    CITY *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'var(--font-family)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    STATE / REGION *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Navigation size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maharashtra"
                      value={stateRegion}
                      onChange={(e) => setStateRegion(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'var(--font-family)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    PINCODE / POSTAL CODE *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 400001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'var(--font-family)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: PAYMENT METHOD SELECTION */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                  3
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-family)' }}>
                  PAYMENT METHOD
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Cashfree Payment Gateway Option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.1rem 1.25rem',
                    border: paymentMethod === 'cashfree' ? '2px solid #000000' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: paymentMethod === 'cashfree' ? '#fafafa' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cashfree"
                      checked={paymentMethod === 'cashfree'}
                      onChange={() => setPaymentMethod('cashfree')}
                      style={{ accentColor: '#000000', width: '18px', height: '18px' }}
                    />
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', display: 'block', color: '#000000' }}>
                        CASHFREE SECURE PAYMENT
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Instant Pay via UPI (GPay, PhonePe, Paytm), Cards, NetBanking
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: 700, fontSize: '0.75rem', background: '#f0fdf4', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    <ShieldCheck size={14} /> RECOMMENDED
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.1rem 1.25rem',
                    border: paymentMethod === 'cod' ? '2px solid #000000' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: paymentMethod === 'cod' ? '#fafafa' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      style={{ accentColor: '#000000', width: '18px', height: '18px' }}
                    />
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', display: 'block', color: '#000000' }}>
                        CASH ON DELIVERY (COD)
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Pay cash upon delivery at your doorstep
                      </span>
                    </div>
                  </div>
                  <Truck size={18} style={{ color: 'var(--text-muted)' }} />
                </label>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loadingPayment}
              style={{
                width: '100%',
                padding: '1.1rem 1.5rem',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                cursor: loadingPayment ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
                opacity: loadingPayment ? 0.75 : 1
              }}
            >
              <Lock size={18} />
              {loadingPayment ? 'PROCESSING ORDER...' : `PLACE ORDER • ${formatPrice(finalTotal)}`}
            </button>

            {/* Trust Footer Notes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', color: 'var(--text-light)', fontSize: '0.78rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={14} /> 100% Verified Order
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Truck size={14} /> Fast Pan-India Delivery
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Lock size={14} /> SSL Secured Gateway
              </span>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary Card */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            position: 'sticky',
            top: '100px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} /> ORDER SUMMARY ({cart.length})
            </h3>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {formatPrice(finalTotal)}
            </span>
          </div>

          {/* Free Shipping Meter */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
            {remainingForFreeShipping > 0 ? (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                Add <strong>{formatPrice(remainingForFreeShipping)}</strong> more to get <strong>FREE SHIPPING</strong>!
              </span>
            ) : (
              <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <CheckCircle2 size={16} /> YOU QUALIFY FOR FREE SHIPPING!
              </span>
            )}
            <div style={{ height: '6px', width: '100%', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: remainingForFreeShipping === 0 ? '#16a34a' : '#000000',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Cart Items Strip */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '0.25rem', marginBottom: '1.5rem' }}>
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '56px', height: '64px', objectFit: 'cover', borderRadius: '4px', background: '#f5f5f5' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h5 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </h5>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', margin: '0.1rem 0 0.3rem' }}>
                    Size: <strong>{item.size}</strong>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.quantity === 1) {
                            setItemToDelete(item);
                          } else {
                            updateQuantity(item.id, item.size, -1);
                          }
                        }}
                        style={{ padding: '2px 6px', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0 6px' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.size, 1)}
                        style={{ padding: '2px 6px', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.9rem' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Promo Code Section */}
          <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            {!appliedCoupon ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Coupon Code (e.g. GOODLUCK10)"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon(e)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.75rem',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  style={{
                    padding: '0.65rem 1rem',
                    background: '#000000',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  APPLY
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.85rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem'
                }}
              >
                <span style={{ color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Tag size={14} /> Coupon <strong>{appliedCoupon.code}</strong> Applied ({appliedCoupon.label})
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  REMOVE
                </button>
              </div>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginTop: '0.4rem' }}>
              💡 Available coupons: <strong>GOODLUCK10</strong> (10% off), <strong>WELCOME15</strong> (15% off)
            </span>
          </div>

          {/* Pricing Breakdown Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items Subtotal</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 700 }}>
                <span>Coupon Discount ({appliedCoupon?.label})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Estimated Shipping</span>
              <span>{shippingFee === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : formatPrice(shippingFee)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                borderTop: '2px dashed var(--border-color)',
                paddingTop: '0.85rem',
                marginTop: '0.4rem'
              }}
            >
              <span>GRAND TOTAL</span>
              <span style={{ fontSize: '1.25rem' }}>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Item Confirmation Modal */}
      {itemToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setItemToDelete(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem 1.75rem 1.5rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              textAlign: 'center',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Trash2 size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>Remove item from checkout?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to remove <strong>{itemToDelete.name} ({itemToDelete.size})</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#ffffff', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeFromCart(itemToDelete.id, itemToDelete.size);
                  setItemToDelete(null);
                  showToast('Item removed from cart');
                }}
                style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', background: '#dc2626', color: '#ffffff', fontWeight: 800 }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
