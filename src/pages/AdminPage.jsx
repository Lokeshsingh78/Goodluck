import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users, CreditCard,
  Plus, Edit, Trash2, CheckCircle, AlertTriangle, XCircle, Search, RefreshCw, Lock,
  ChevronDown, Check
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getApiUrl } from '../config/api';

const BADGE_STYLES = {
  '': {
    label: 'Standard (ALL)',
    bg: '#f3f4f6',
    color: '#374151',
    border: '#e5e7eb'
  },
  'Bestseller': {
    label: 'Bestseller',
    bg: '#fef3c7',
    color: '#92400e',
    border: '#fde68a'
  },
  'Popular': {
    label: 'Popular',
    bg: '#dbeafe',
    color: '#1e40af',
    border: '#bfdbfe'
  }
};

const CATEGORY_OPTIONS = [
  { value: '', label: 'Standard (ALL)' },
  { value: 'Bestseller', label: 'Bestseller' },
  { value: 'Popular', label: 'Popular' }
];

const CompactCategorySelector = ({ value, onChange, isModal = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentKey = value || '';
  const currentStyle = BADGE_STYLES[currentKey] || BADGE_STYLES[''];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', width: isModal ? '100%' : 'auto' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.4rem',
          padding: isModal ? '0.55rem 0.85rem' : '0.25rem 0.6rem',
          height: isModal ? '38px' : '28px',
          width: isModal ? '100%' : '135px',
          background: currentStyle.bg,
          color: currentStyle.color,
          border: `1px solid ${currentStyle.border}`,
          borderRadius: '6px',
          fontWeight: 700,
          fontSize: isModal ? '0.85rem' : '0.75rem',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 2px rgba(0,0,0,0.08)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <span>{currentStyle.label}</span>
        <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 1000,
            width: isModal ? '100%' : '145px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '4px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            border: '1px solid #e2e8f0'
          }}
        >
          {CATEGORY_OPTIONS.map((opt) => {
            const isSelected = opt.value === currentKey;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 800 : 600,
                  color: isSelected ? '#0f172a' : '#475569',
                  background: isSelected ? '#f1f5f9' : 'transparent',
                  transition: 'background 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={12} color="#0f172a" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const AdminPage = () => {
  const { user, userToken, formatPrice, showToast, navigateTo, fetchProducts } = useShop();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'users' | 'payments'
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodForm, setProdForm] = useState({
    name: '', price: 1499, discountPrice: 0, stock: 50,
    quoteBack: '', tag: 'NEW', badge: '', images: ['/images/better_tshirt.png'],
    description: ''
  });
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userToken && user?.role === 'admin') {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [userToken, user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${userToken}` };

      const [statsRes, prodsRes, ordsRes, usersRes, paysRes] = await Promise.all([
        fetch(getApiUrl('/api/admin/stats'), { headers }),
        fetch(getApiUrl('/api/admin/products'), { headers }),
        fetch(getApiUrl('/api/admin/orders'), { headers }),
        fetch(getApiUrl('/api/admin/users'), { headers }),
        fetch(getApiUrl('/api/admin/payments'), { headers })
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
        setLowStock(d.lowStockProducts || []);
      }
      if (prodsRes.ok) {
        const d = await prodsRes.json();
        setProducts(d.products || []);
      }
      if (ordsRes.ok) {
        const d = await ordsRes.json();
        setOrders(d.orders || []);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsersList(d.users || []);
      }
      if (paysRes.ok) {
        const d = await paysRes.json();
        setPayments(d.payments || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!userToken || user?.role !== 'admin') {
    return (
      <div className="section container" style={{ minHeight: '60vh', textAlign: 'center', paddingTop: '4rem' }}>
        <Lock size={48} style={{ margin: '0 auto 1rem', color: '#dc2626' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase' }}>ACCESS DENIED</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          You must be logged in as an Admin to access the management portal.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '2rem' }}>
          Demo Admin: <strong>admin@goodlucksociety.in</strong> (pass: <strong>admin123</strong>)
        </p>
        <button className="btn-primary btn-dark" onClick={() => navigateTo('home')}>
          RETURN TO HOME
        </button>
      </div>
    );
  }

  // Handle Product Save/Edit
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodForm.images || prodForm.images.length === 0) {
      alert('Please add at least one product image.');
      return;
    }
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      };

      const url = editingProduct ? getApiUrl(`/api/admin/products/${editingProduct.id}`) : getApiUrl('/api/admin/products');
      const method = editingProduct ? 'PUT' : 'POST';

      const payload = {
        ...prodForm,
        imageFront: prodForm.images[0],
        imageBack: prodForm.images[1] || prodForm.images[0]
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        showToast(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setShowProductModal(false);
        setEditingProduct(null);
        await fetchProducts(); // Refresh global shop catalog state
        loadAdminData();
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (err) {
      alert('Error saving product: ' + err.message);
    }
  };

  // Delete product permanently
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/products/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (res.ok) {
        showToast('Product deleted successfully');
        await fetchProducts(); // Refresh global shop catalog state
        loadAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // Quick change product category badge
  const handleQuickBadgeChange = async (id, newBadge) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/products/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({ badge: newBadge })
      });
      if (res.ok) {
        showToast(`Category updated to ${newBadge || 'Standard'}`);
        await fetchProducts();
        loadAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update category badge');
      }
    } catch (err) {
      alert('Error updating category badge');
    }
  };

  // Handle Multiple Image Uploads from computer
  const handleUploadMultipleImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
      const res = await fetch(getApiUrl('/api/admin/products/upload-multiple'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.imageUrls) {
        setProdForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...data.imageUrls]
        }));
        showToast(`${data.imageUrls.length} image(s) uploaded!`);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setProdForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), imageUrlInput.trim()]
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setProdForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleMakePrimaryImage = (indexToPrimary) => {
    setProdForm((prev) => {
      const list = [...(prev.images || [])];
      const [selected] = list.splice(indexToPrimary, 1);
      return {
        ...prev,
        images: [selected, ...list]
      };
    });
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Order status updated to ${newStatus}`);
        loadAdminData();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Toggle User Active Status
  const handleToggleUser = async (userId, currentActive) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${userId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({ isActive: !currentActive })
      });
      if (res.ok) {
        showToast('User status updated');
        loadAdminData();
      }
    } catch (err) {
      alert('Failed to update user');
    }
  };

  return (
    <div className="section container" style={{ minHeight: '85vh', paddingBottom: '4rem' }}>
      {/* Admin Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="section-label">ADMINISTRATION PORTAL</span>
          <h2 className="section-title" style={{ margin: 0 }}>STORE MANAGEMENT CONTROL</h2>
        </div>
        <button
          onClick={loadAdminData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            background: '#fff',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} /> REFRESH DATA
        </button>
      </div>

      {/* Admin Tabs Bar */}
      <div style={{ display: 'flex', borderBottom: '2px solid #000000', marginBottom: '2rem', overflowX: 'auto', gap: '0.25rem' }}>
        {[
          { id: 'overview', label: 'DASHBOARD', icon: LayoutDashboard },
          { id: 'products', label: 'PRODUCTS', icon: Package },
          { id: 'orders', label: 'ORDERS', icon: ShoppingCart },
          { id: 'users', label: 'USERS', icon: Users },
          { id: 'payments', label: 'PAYMENTS', icon: CreditCard }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.75rem 1.25rem',
                background: isActive ? '#000000' : 'transparent',
                color: isActive ? '#ffffff' : '#000000',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
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

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>Loading Admin Data...</p>
      ) : (
        <>
          {/* TAB 1: OVERVIEW / DASHBOARD */}
          {activeTab === 'overview' && stats && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <div style={{ padding: '1.5rem', background: '#f9f9f9', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700 }}>TOTAL REVENUE</span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0.25rem 0 0' }}>{formatPrice(stats.totalRevenue)}</h3>
                </div>

                <div style={{ padding: '1.5rem', background: '#f9f9f9', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700 }}>TOTAL ORDERS</span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0.25rem 0 0' }}>{stats.totalOrders}</h3>
                </div>

                <div style={{ padding: '1.5rem', background: '#f9f9f9', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700 }}>TOTAL PRODUCTS</span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0.25rem 0 0' }}>{stats.totalProducts}</h3>
                </div>

                <div style={{ padding: '1.5rem', background: '#f9f9f9', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700 }}>REGISTERED USERS</span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0.25rem 0 0' }}>{stats.totalUsers}</h3>
                </div>

                <div style={{ padding: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>SUCCESSFUL PAYMENTS</span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#15803d', margin: '0.25rem 0 0' }}>{stats.successfulPayments}</h3>
                </div>

                <div style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 700 }}>FAILED PAYMENTS</span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#dc2626', margin: '0.25rem 0 0' }}>{stats.failedPayments}</h3>
                </div>
              </div>

              {/* Low Stock Warning */}
              {lowStock.length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                  <h4 style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 800 }}>
                    <AlertTriangle size={20} /> LOW STOCK ALERT ({lowStock.length} Products)
                  </h4>
                  <ul style={{ marginTop: '0.75rem', paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#92400e' }}>
                    {lowStock.map((p) => (
                      <li key={p.id}>
                        <strong>{p.name}</strong> — Stock remaining: <span style={{ fontWeight: 800 }}>{p.stock}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
                  CATALOG PRODUCTS ({products.length})
                </h3>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProdForm({
                      name: '', price: 1499, discountPrice: 0, stock: 50,
                      quoteBack: '', tag: 'NEW', badge: '', images: ['/images/better_tshirt.png'],
                      description: ''
                    });
                    setImageUrlInput('');
                    setShowProductModal(true);
                  }}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Plus size={16} /> ADD PRODUCT
                </button>
              </div>

              {/* Products Table */}
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead style={{ background: '#f5f5f5', borderBottom: '1px solid var(--border-color)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>PRODUCT</th>
                      <th style={{ padding: '0.75rem 1rem' }}>CATEGORY FILTER</th>
                      <th style={{ padding: '0.75rem 1rem' }}>IMAGES</th>
                      <th style={{ padding: '0.75rem 1rem' }}>PRICE</th>
                      <th style={{ padding: '0.75rem 1rem' }}>STOCK</th>
                      <th style={{ padding: '0.75rem 1rem' }}>REAR PRINT QUOTE</th>
                      <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const prodImgs = p.images && p.images.length > 0 ? p.images : [p.image_front || p.imageFront].filter(Boolean);
                      const currentBadge = p.badge || '';
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={prodImgs[0] || '/images/better_tshirt.png'} alt="" style={{ width: '36px', height: '44px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div>
                              <strong style={{ display: 'block' }}>{p.name}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{p.id}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <CompactCategorySelector
                              value={currentBadge}
                              onChange={(newBadge) => handleQuickBadgeChange(p.id, newBadge)}
                            />
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {prodImgs.slice(0, 2).map((img, i) => (
                                  <img
                                    key={i}
                                    src={img}
                                    alt=""
                                    style={{
                                      width: '24px',
                                      height: '28px',
                                      objectFit: 'cover',
                                      borderRadius: '3px',
                                      border: '1.5px solid #ffffff',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                      marginLeft: i > 0 ? '-6px' : '0'
                                    }}
                                  />
                                ))}
                              </div>
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#475569',
                                background: '#f1f5f9',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0'
                              }}>
                                {prodImgs.length} {prodImgs.length === 1 ? 'Img' : 'Imgs'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{formatPrice(p.price)}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ fontWeight: 800, color: p.stock < 10 ? '#dc2626' : '#000' }}>{p.stock}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontStyle: 'italic' }}>"{p.quote_back || p.quoteBack}"</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {p.isActive ? (
                              <span style={{ color: '#16a34a', fontWeight: 700 }}>Active</span>
                            ) : (
                              <span style={{ color: '#dc2626', fontWeight: 700 }}>Inactive</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                const existingImages = p.images && p.images.length > 0 ? p.images : [p.image_front || p.imageFront, p.image_back || p.imageBack].filter(Boolean);
                                setProdForm({
                                  name: p.name,
                                  price: p.price,
                                  discountPrice: p.discount_price || 0,
                                  stock: p.stock,
                                  quoteBack: p.quote_back || p.quoteBack || '',
                                  tag: p.tag || 'NEW',
                                  badge: p.badge || '',
                                  images: existingImages.length > 0 ? existingImages : ['/images/better_tshirt.png'],
                                  description: p.description || ''
                                });
                                setImageUrlInput('');
                                setShowProductModal(true);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#dc2626' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                ALL CUSTOMER ORDERS ({orders.length})
              </h3>

              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead style={{ background: '#f5f5f5', borderBottom: '1px solid var(--border-color)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>ORDER ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>CUSTOMER</th>
                      <th style={{ padding: '0.75rem 1rem' }}>AMOUNT</th>
                      <th style={{ padding: '0.75rem 1rem' }}>PAYMENT STATUS</th>
                      <th style={{ padding: '0.75rem 1rem' }}>ORDER STATUS</th>
                      <th style={{ padding: '0.75rem 1rem' }}>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{o.id}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <strong>{o.customer_name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customer_email} &bull; {o.customer_phone}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{formatPrice(o.final_amount)}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ fontWeight: 700, color: o.payment_status === 'paid' ? '#16a34a' : '#d97706' }}>
                            {o.payment_status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(o.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                REGISTERED USERS ({usersList.length})
              </h3>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead style={{ background: '#f5f5f5', borderBottom: '1px solid var(--border-color)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>NAME</th>
                      <th style={{ padding: '0.75rem 1rem' }}>EMAIL</th>
                      <th style={{ padding: '0.75rem 1rem' }}>ROLE</th>
                      <th style={{ padding: '0.75rem 1rem' }}>PHONE</th>
                      <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>{u.id}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{u.name}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', background: u.role === 'admin' ? '#000' : '#e5e7eb', color: u.role === 'admin' ? '#fff' : '#000', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>{u.phone || '-'}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {u.is_active ? <span style={{ color: '#16a34a', fontWeight: 700 }}>Active</span> : <span style={{ color: '#dc2626', fontWeight: 700 }}>Deactivated</span>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUser(u.id, u.is_active)}
                              style={{ padding: '0.3rem 0.6rem', border: '1px solid var(--border-color)', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENTS LOG */}
          {activeTab === 'payments' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                PAYMENT LOGS ({payments.length})
              </h3>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead style={{ background: '#f5f5f5', borderBottom: '1px solid var(--border-color)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>PAYMENT ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>ORDER ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>CASHFREE ORDER ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>AMOUNT</th>
                      <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                      <th style={{ padding: '0.75rem 1rem' }}>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{p.cashfree_payment_id || p.razorpay_payment_id || p.id}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{p.order_id}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>{p.cashfree_order_id || p.razorpay_order_id}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{formatPrice(p.amount)}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ fontWeight: 700, color: p.status === 'captured' ? '#16a34a' : p.status === 'failed' ? '#dc2626' : '#d97706' }}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(p.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <>
          <div className="menu-overlay open" onClick={() => setShowProductModal(false)} style={{ zIndex: 1200 }} />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '520px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              zIndex: 1201,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
              {editingProduct ? 'EDIT PRODUCT' : 'CREATE NEW PRODUCT'}
            </h3>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>PRODUCT NAME</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>PRICE (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>STOCK QUANTITY</label>
                  <input
                    type="number"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  CATEGORY FILTER
                </label>
                <CompactCategorySelector
                  value={prodForm.badge}
                  onChange={(newBadge) => setProdForm({ ...prodForm, badge: newBadge })}
                  isModal={true}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>REAR PRINT STATEMENT QUOTE</label>
                <input
                  type="text"
                  required
                  placeholder='e.g. "MY MAN IS HOTTER THAN YOU."'
                  value={prodForm.quoteBack}
                  onChange={(e) => setProdForm({ ...prodForm, quoteBack: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  PRODUCT IMAGES GALLERY (MULTIPLE IMAGES)
                </label>

                {/* Thumbnail strip of added images */}
                {prodForm.images && prodForm.images.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {prodForm.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          width: '70px',
                          height: '85px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: idx === 0 ? '2px solid #000000' : '1px solid var(--border-color)',
                          background: '#f5f5f5'
                        }}
                      >
                        <img src={imgUrl} alt={`Prod ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        
                        {/* Primary Badge */}
                        {idx === 0 && (
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: '#000000',
                              color: '#ffffff',
                              fontSize: '0.6rem',
                              fontWeight: 800,
                              textAlign: 'center',
                              padding: '1px 0'
                            }}
                          >
                            MAIN
                          </span>
                        )}

                        {/* Make Main Button */}
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleMakePrimaryImage(idx)}
                            title="Set as Main Image"
                            style={{
                              position: 'absolute',
                              bottom: '2px',
                              left: '2px',
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '3px',
                              fontSize: '0.55rem',
                              padding: '1px 3px',
                              cursor: 'pointer'
                            }}
                          >
                            SET MAIN
                          </button>
                        )}

                        {/* Remove Image Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove image"
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: 800
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#dc2626', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                    No images added yet. Please upload or add image URLs below.
                  </p>
                )}

                {/* Upload computer images */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Upload image(s) from computer (Multiple files supported):
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUploadMultipleImages}
                    style={{ fontSize: '0.8rem', width: '100%' }}
                  />
                </div>

                {/* Add Image URL */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Or enter Image URL (e.g. /images/better_tshirt.png)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    style={{ padding: '0.5rem 0.8rem', background: '#000', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + ADD URL
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', background: '#fff', fontWeight: 700, borderRadius: 'var(--radius-sm)' }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '0.75rem', border: 'none', background: '#000', color: '#fff', fontWeight: 800, borderRadius: 'var(--radius-sm)' }}
                >
                  SAVE PRODUCT
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
