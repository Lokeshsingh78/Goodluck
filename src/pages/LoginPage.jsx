import React, { useState, useEffect } from 'react';
import {
  Lock, Mail, User as UserIcon, Phone, MapPin, LogIn, UserPlus, LogOut,
  ShoppingBag, ShieldCheck, ArrowRight, Heart, Edit, CheckCircle2, Clock,
  Truck, Save, RefreshCw, Star, Package
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const LoginPage = () => {
  const {
    loginUser, registerUser, logoutUser, user, setUser, userToken,
    navigateTo, navigateToProduct, formatPrice, showToast, wishlist, toggleWishlist, addToCart,
    currentView
  } = useShop();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Logged-in Profile State
  const [profileTab, setProfileTab] = useState(currentView === 'wishlist' ? 'wishlist' : 'overview'); // 'overview' | 'orders' | 'wishlist'
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // User Orders & Wishlist State
  const [userOrders, setUserOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingProfileData, setLoadingProfileData] = useState(false);

  // Orders Pagination State
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_PER_PAGE = 4;

  useEffect(() => {
    if (currentView === 'wishlist') {
      setProfileTab('wishlist');
    }
  }, [currentView]);

  useEffect(() => {
    if (userToken && user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
      fetchUserOrdersAndWishlist();
    }
  }, [userToken, user?.id]);

  const fetchUserOrdersAndWishlist = async () => {
    if (!userToken) return;
    setLoadingProfileData(true);
    try {
      const headers = { Authorization: `Bearer ${userToken}` };
      const [ordersRes, wishlistRes] = await Promise.all([
        fetch('/api/orders/my-orders', { headers }),
        fetch('/api/wishlist', { headers })
      ]);
      if (ordersRes.ok) {
        const d = await ordersRes.json();
        setUserOrders(d.orders || []);
      }
      if (wishlistRes.ok) {
        const d = await wishlistRes.json();
        setWishlistItems(d.wishlist || []);
      }
    } catch (e) {
      console.error('Profile data fetch error:', e);
    } finally {
      setLoadingProfileData(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          address: editAddress
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('goodluck_user', JSON.stringify(data.user));
        showToast('Profile details updated successfully!');
      } else {
        alert(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          showToast(`Welcome back, ${res.user.name}!`);
          if (res.user.role === 'admin') {
            navigateTo('admin');
          } else {
            navigateTo('orders');
          }
        }
      } else {
        const res = await registerUser({ email, password, name, phone });
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          showToast('Account created successfully!');
          navigateTo('orders');
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section container login-page-container" style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem 1rem 7rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {userToken && user ? (
        /* LOGGED IN PREMIUM USER PROFILE HUB */
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Hero Profile Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #000000 0%, #171717 100%)',
              color: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 2rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              marginBottom: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(237, 255, 167, 0.2) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                position: 'relative',
                zIndex: 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#edffa7',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.8rem',
                    boxShadow: '0 4px 14px rgba(237, 255, 167, 0.4)'
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', color: '#ffffff' }}>
                      {user.name}
                    </h2>
                    {user.role === 'admin' && (
                      <span
                        style={{
                          padding: '0.25rem 0.65rem',
                          background: '#ef4444',
                          color: '#ffffff',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 900,
                          letterSpacing: '0.05em'
                        }}
                      >
                        🛡️ STORE ADMIN
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#a3a3a3' }}>
                    {user.email} {user.phone ? `• 📞 ${user.phone}` : ''}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigateTo('admin')}
                    style={{
                      padding: '0.75rem 1.25rem',
                      background: '#ffffff',
                      color: '#000000',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <ShieldCheck size={16} /> ADMIN PORTAL
                  </button>
                )}
                <button
                  onClick={logoutUser}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#fca5a5',
                    border: '1px solid #ef4444',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
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
          </div>

          {/* Quick Metrics Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem'
            }}
          >
            <div
              onClick={() => setProfileTab('orders')}
              style={{
                padding: '1.25rem',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                  ORDERS PLACED
                </span>
                <ShoppingBag size={20} color="#000" />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0.4rem 0 0' }}>{userOrders.length}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to view order history &rarr;</span>
            </div>

            <div
              onClick={() => setProfileTab('wishlist')}
              style={{
                padding: '1.25rem',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                  WISHLIST ITEMS
                </span>
                <Heart size={20} color="#dc2626" fill="#dc2626" />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0.4rem 0 0' }}>{wishlist.length}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saved statement tees &rarr;</span>
            </div>

            <div
              onClick={() => setProfileTab('overview')}
              style={{
                padding: '1.25rem',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                  SHIPPING ADDRESS
                </span>
                <MapPin size={20} color="#000" />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0.6rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.address ? user.address : 'No address saved'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manage address &rarr;</span>
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '2px solid #000000',
              marginBottom: '2rem',
              overflowX: 'auto',
              gap: '0.25rem'
            }}
          >
            {[
              { id: 'overview', label: 'EDIT PROFILE & ADDRESS', icon: UserIcon },
              { id: 'orders', label: `MY ORDERS (${userOrders.length})`, icon: ShoppingBag },
              { id: 'wishlist', label: `MY WISHLIST (${wishlist.length})`, icon: Heart }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = profileTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1.25rem',
                    background: isActive ? '#000000' : 'transparent',
                    color: isActive ? '#ffffff' : '#000000',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    borderTopLeftRadius: 'var(--radius-sm)',
                    borderTopRightRadius: 'var(--radius-sm)'
                  }}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: EDIT PROFILE & ADDRESS */}
          {profileTab === 'overview' && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                PERSONAL DETAILS & DEFAULT SHIPPING ADDRESS
              </h3>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      FULL NAME
                    </label>
                    <div style={{ position: 'relative' }}>
                      <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      PHONE NUMBER
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    EMAIL ADDRESS (LOCKED)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      style={{
                        width: '100%',
                        padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: '#f5f5f5',
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    DEFAULT SHIPPING ADDRESS
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-light)' }} />
                    <textarea
                      rows={3}
                      placeholder="Enter house no, street name, landmark, city, state, pincode"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      padding: '0.85rem 2rem',
                      background: '#000000',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      cursor: savingProfile ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Save size={16} /> {savingProfile ? 'SAVING...' : 'SAVE PROFILE CHANGES'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {profileTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
                  MY RECENT ORDERS ({userOrders.length})
                </h3>
                <button
                  onClick={fetchUserOrdersAndWishlist}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: '#fff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <RefreshCw size={14} /> REFRESH
                </button>
              </div>

              {loadingProfileData ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
              ) : userOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <ShoppingBag size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ fontWeight: 800, textTransform: 'uppercase' }}>NO ORDERS PLACED YET</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Explore our statement t-shirt catalog and make your first order.
                  </p>
                  <button className="btn-primary btn-dark" onClick={() => navigateTo('catalog')}>
                    SHOP CATALOG
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {userOrders
                      .slice((ordersPage - 1) * ORDERS_PER_PAGE, ordersPage * ORDERS_PER_PAGE)
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

                            <div style={{ textAlign: 'right' }}>
                              <span
                                style={{
                                  padding: '0.25rem 0.6rem',
                                  background: ord.payment_status === 'paid' ? '#dcfce7' : '#fef3c7',
                                  color: ord.payment_status === 'paid' ? '#166534' : '#92400e',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800
                                }}
                              >
                                {ord.status?.toUpperCase()} ({ord.payment_status?.toUpperCase()})
                              </span>
                              <div style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '0.3rem' }}>
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

                          {/* Courier info */}
                          {ord.carrier_name && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                              <span style={{ fontWeight: 800 }}>🚚 COURIER TRACKING:</span> {ord.carrier_name} {ord.tracking_number ? `(AWB: ${ord.tracking_number})` : ''}
                              {ord.estimated_delivery && <span style={{ marginLeft: '1rem', color: '#475569' }}>Est. Delivery: {ord.estimated_delivery}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {/* Pagination Controls Bar */}
                  {Math.ceil(userOrders.length / ORDERS_PER_PAGE) > 1 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '1.5rem',
                        paddingTop: '1.25rem',
                        borderTop: '1px solid var(--border-color)',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Showing {((ordersPage - 1) * ORDERS_PER_PAGE) + 1} - {Math.min(ordersPage * ORDERS_PER_PAGE, userOrders.length)} of {userOrders.length} orders
                      </span>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          onClick={() => setOrdersPage(prev => Math.max(prev - 1, 1))}
                          disabled={ordersPage === 1}
                          style={{
                            padding: '0.4rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            background: ordersPage === 1 ? '#f5f5f5' : '#ffffff',
                            color: ordersPage === 1 ? '#a3a3a3' : '#000000',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: ordersPage === 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          &larr; PREV
                        </button>
                        {Array.from({ length: Math.ceil(userOrders.length / ORDERS_PER_PAGE) }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setOrdersPage(pageNum)}
                            style={{
                              minWidth: '32px',
                              height: '32px',
                              padding: '0 0.4rem',
                              borderRadius: 'var(--radius-sm)',
                              border: pageNum === ordersPage ? '1px solid #000000' : '1px solid var(--border-color)',
                              background: pageNum === ordersPage ? '#000000' : '#ffffff',
                              color: pageNum === ordersPage ? '#ffffff' : '#000000',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            {pageNum}
                          </button>
                        ))}
                        <button
                          onClick={() => setOrdersPage(prev => Math.min(prev + 1, Math.ceil(userOrders.length / ORDERS_PER_PAGE)))}
                          disabled={ordersPage === Math.ceil(userOrders.length / ORDERS_PER_PAGE)}
                          style={{
                            padding: '0.4rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            background: ordersPage === Math.ceil(userOrders.length / ORDERS_PER_PAGE) ? '#f5f5f5' : '#ffffff',
                            color: ordersPage === Math.ceil(userOrders.length / ORDERS_PER_PAGE) ? '#a3a3a3' : '#000000',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: ordersPage === Math.ceil(userOrders.length / ORDERS_PER_PAGE) ? 'not-allowed' : 'pointer'
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
          )}

          {/* TAB 3: WISHLIST */}
          {profileTab === 'wishlist' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                MY SAVED WISHLIST ({wishlist.length})
              </h3>

              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <Heart size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ fontWeight: 800, textTransform: 'uppercase' }}>YOUR WISHLIST IS EMPTY</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Click the heart icon on any statement tee or product detail page to save it here.
                  </p>
                  <button className="btn-primary btn-dark" onClick={() => navigateTo('catalog')}>
                    BROWSE STATEMENT TEES
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  {wishlist.map((item) => (
                    <div key={item.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: '#fff', textAlign: 'center', position: 'relative' }}>
                      <button
                        onClick={() => toggleWishlist(item)}
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}
                        title="Remove from wishlist"
                      >
                        <Heart size={16} fill="#dc2626" color="#dc2626" />
                      </button>
                      <img src={item.imageFront || item.image_front || '/images/better_tshirt.png'} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }} />
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.4rem', textTransform: 'uppercase' }}>{item.name}</h4>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.75rem' }}>{formatPrice(item.price)}</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => addToCart(item, 'M', 1)}
                          style={{ flex: 1, padding: '0.6rem', background: '#000', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          + ADD TO BAG
                        </button>
                        <button
                          onClick={() => navigateToProduct(item.id)}
                          style={{ padding: '0.6rem 0.75rem', background: '#fff', color: '#000', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          VIEW
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* LOGGED OUT SIGN IN / REGISTER CARD */
        <div
          className="login-card-mobile-padding"
          style={{
            width: '100%',
            maxWidth: '460px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
            padding: '2.5rem 2rem',
            color: '#000000'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-label" style={{ marginBottom: '0.25rem' }}>
              GOOD LUCK SOCIETY
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
              {mode === 'login' ? 'SIGN IN TO ACCOUNT' : 'CREATE AN ACCOUNT'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              {mode === 'login'
                ? 'Enter your credentials to access your statement orders'
                : 'Join the Good Luck Society community today'}
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: 'var(--radius-sm)',
                color: '#991b1b',
                fontSize: '0.88rem',
                marginBottom: '1.5rem',
                fontWeight: 600
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              borderBottom: '2px solid #000000',
              marginBottom: '1.75rem'
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: mode === 'login' ? '#000000' : 'transparent',
                color: mode === 'login' ? '#ffffff' : '#000000',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: mode === 'register' ? '#000000' : 'transparent',
                color: mode === 'register' ? '#ffffff' : '#000000',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              CREATE ACCOUNT
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  FULL NAME
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  PHONE NUMBER
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 0.8rem 0.8rem 2.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.75rem',
                padding: '0.95rem',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'PROCESSING...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <p>
                Demo Admin Login: <strong>admin@goodlucksociety.in</strong> (pass: <strong>admin123</strong>)
              </p>
            ) : (
              <p>By signing up you agree to Good Luck Society terms and privacy policies.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
