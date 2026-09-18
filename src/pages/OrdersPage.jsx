import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle2, AlertCircle, ShoppingBag, User, MapPin, LogOut } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getApiUrl } from '../config/api';

export const OrdersPage = () => {
  const { user, userToken, logoutUser, setIsAuthOpen, formatPrice, navigateTo } = useShop();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 4;

  useEffect(() => {
    if (userToken) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [userToken]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(getApiUrl('/api/orders/my-orders'), {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!userToken) {
    return (
      <div className="section container" style={{ minHeight: '60vh', textAlign: 'center', paddingTop: '4rem' }}>
        <User size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase' }}>MY ACCOUNT</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Please sign in to view your account details and order history.
        </p>
        <button
          className="btn-primary btn-dark"
          onClick={() => setIsAuthOpen(true)}
          style={{ padding: '0.75rem 2rem' }}
        >
          SIGN IN / REGISTER
        </button>
      </div>
    );
  }

  const getStatusBadge = (status, paymentStatus) => {
    if (paymentStatus === 'paid' || status === 'delivered') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontWeight: 700, fontSize: '0.8rem' }}>
          <CheckCircle2 size={15} /> {status.toUpperCase()} (PAID)
        </span>
      );
    } else if (paymentStatus === 'failed') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#dc2626', fontWeight: 700, fontSize: '0.8rem' }}>
          <AlertCircle size={15} /> PAYMENT FAILED
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#d97706', fontWeight: 700, fontSize: '0.8rem' }}>
        <Clock size={15} /> {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="section container" style={{ minHeight: '80vh' }}>
      {/* Account Info Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '1.5rem',
          marginBottom: '2.5rem',
          borderBottom: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <span className="section-label">USER ACCOUNT</span>
          <h2 className="section-title" style={{ margin: 0 }}>WELCOME, {user?.name?.toUpperCase()}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {user?.email} {user?.phone ? `| ${user.phone}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {user?.role === 'admin' && (
            <button
              onClick={() => navigateTo('admin')}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              ADMIN PANEL
            </button>
          )}
          <button
            onClick={logoutUser}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#ffffff',
              color: '#dc2626',
              border: '1px solid #dc2626',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <LogOut size={16} /> LOGOUT
          </button>
        </div>
      </div>

      {/* Address & Profile Box */}
      {user?.address && (
        <div
          style={{
            backgroundColor: '#f9f9f9',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          <MapPin size={20} style={{ color: 'var(--bg-accent)', marginTop: '2px' }} />
          <div>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
              DEFAULT SHIPPING ADDRESS
            </h5>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem', margin: 0 }}>
              {user.address}
            </p>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          ORDER HISTORY ({orders.length})
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <Package size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontWeight: 700 }}>NO ORDERS PLACED YET</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Explore our collection of statement t-shirts and elevate your wardrobe.
            </p>
            <button
              className="btn-primary btn-dark"
              onClick={() => navigateTo('catalog')}
            >
              SHOP CATALOG
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders
                .slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE)
                .map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      padding: '1.5rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: '1rem',
                        marginBottom: '1rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700 }}>ORDER ID</span>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{ord.id}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Placed on {new Date(ord.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        {getStatusBadge(ord.status, ord.payment_status)}
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, textAlign: 'right', marginTop: '0.25rem' }}>
                          {formatPrice(ord.final_amount)}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {ord.items && ord.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                          <div>
                            <strong>{item.product_name}</strong> &bull; Size: {item.size} &bull; Qty: {item.quantity}
                          </div>
                          <div style={{ fontWeight: 700 }}>
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Visual Order Progress Tracker */}
                    <div style={{ margin: '1.25rem 0', padding: '1rem', background: '#fafafa', borderRadius: 'var(--radius-sm)', border: '1px solid #f4f4f5' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                        LIVE SHIPMENT TRACKER
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                        {/* Tracker Progress Line */}
                        <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '3px', background: '#e4e4e7', zIndex: 1 }} />
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '10%',
                            width: ord.status === 'delivered' ? '80%' : ord.status === 'shipped' ? '55%' : ord.status === 'processing' ? '30%' : '10%',
                            height: '3px',
                            background: '#000000',
                            zIndex: 2,
                            transition: 'all 0.4s ease'
                          }}
                        />

                        {/* Tracker Nodes */}
                        {[
                          { label: 'Placed', active: true },
                          { label: 'Processing', active: ['processing', 'shipped', 'delivered'].includes(ord.status?.toLowerCase()) || ord.payment_status === 'paid' },
                          { label: 'Shipped', active: ['shipped', 'delivered'].includes(ord.status?.toLowerCase()) },
                          { label: 'Delivered', active: ord.status?.toLowerCase() === 'delivered' }
                        ].map((step, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: step.active ? '#000000' : '#ffffff',
                                border: step.active ? '2px solid #000000' : '2px solid #d4d4d8',
                                color: step.active ? '#ffffff' : '#a1a1aa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 800
                              }}
                            >
                              {step.active ? '✓' : idx + 1}
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: step.active ? 800 : 500, color: step.active ? '#000000' : '#a1a1aa', marginTop: '0.3rem' }}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Carrier Tracking Info */}
                    {ord.carrier_name && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 800 }}>🚚 COURIER TRACKING:</span> {ord.carrier_name} {ord.tracking_number ? `(AWB: ${ord.tracking_number})` : ''}
                        {ord.estimated_delivery && <span style={{ marginLeft: '1rem', color: '#475569' }}>Est. Delivery: {ord.estimated_delivery}</span>}
                      </div>
                    )}

                    {/* Cashfree Transaction ID if present */}
                    {(ord.cashfree_payment_id || ord.razorpay_payment_id) && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        Cashfree Payment ID: <code>{ord.cashfree_payment_id || ord.razorpay_payment_id}</code>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Pagination Controls Bar */}
            {Math.ceil(orders.length / ORDERS_PER_PAGE) > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '2rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Showing {((currentPage - 1) * ORDERS_PER_PAGE) + 1} - {Math.min(currentPage * ORDERS_PER_PAGE, orders.length)} of {orders.length} orders
                </span>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: currentPage === 1 ? '#f5f5f5' : '#ffffff',
                      color: currentPage === 1 ? '#a3a3a3' : '#000000',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    &larr; PREV
                  </button>
                  {Array.from({ length: Math.ceil(orders.length / ORDERS_PER_PAGE) }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        minWidth: '32px',
                        height: '32px',
                        padding: '0 0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        border: pageNum === currentPage ? '1px solid #000000' : '1px solid var(--border-color)',
                        background: pageNum === currentPage ? '#000000' : '#ffffff',
                        color: pageNum === currentPage ? '#ffffff' : '#000000',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(orders.length / ORDERS_PER_PAGE)))}
                    disabled={currentPage === Math.ceil(orders.length / ORDERS_PER_PAGE)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: currentPage === Math.ceil(orders.length / ORDERS_PER_PAGE) ? '#f5f5f5' : '#ffffff',
                      color: currentPage === Math.ceil(orders.length / ORDERS_PER_PAGE) ? '#a3a3a3' : '#000000',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: currentPage === Math.ceil(orders.length / ORDERS_PER_PAGE) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    NEXT &rarr;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
