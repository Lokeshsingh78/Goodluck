import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, LogOut, ShoppingBag, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AuthModal = () => {
  const { isAuthOpen, setIsAuthOpen, loginUser, registerUser, logoutUser, user, userToken, navigateTo, showToast } = useShop();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthOpen) return null;

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
          setIsAuthOpen(false);
          setEmail('');
          setPassword('');
        }
      } else {
        const res = await registerUser({ email, password, name, phone });
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          showToast('Account created successfully!');
          setIsAuthOpen(false);
          setEmail('');
          setPassword('');
          setName('');
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="menu-overlay open"
        onClick={() => setIsAuthOpen(false)}
        style={{ zIndex: 1100 }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 1101,
          padding: '2rem',
          color: '#000000'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--bg-accent)' }}>
              GOOD LUCK SOCIETY
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
              {userToken && user ? 'MY PROFILE' : mode === 'login' ? 'SIGN IN TO ACCOUNT' : 'CREATE AN ACCOUNT'}
            </h3>
          </div>
          <button
            onClick={() => setIsAuthOpen(false)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* LOGGED IN USER VIEW */}
        {userToken && user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#f9f9f9', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', textTransform: 'uppercase' }}>{user.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <span style={{ padding: '0.2rem 0.6rem', background: user.role === 'admin' ? '#000' : '#e5e7eb', color: user.role === 'admin' ? '#fff' : '#000', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                  ROLE: {user.role?.toUpperCase()}
                </span>
                {user.phone && (
                  <span style={{ padding: '0.2rem 0.6rem', background: '#f3f4f6', color: '#374151', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                    📞 {user.phone}
                  </span>
                )}
              </div>

              {user.address && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong>Address:</strong> {user.address}
                </div>
              )}
            </div>

            {user.role === 'admin' ? (
              <button
                onClick={() => {
                  navigateTo('admin');
                  setIsAuthOpen(false);
                }}
                style={{
                  padding: '0.85rem',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShieldCheck size={18} /> ADMIN CONTROL PANEL
              </button>
            ) : (
              <button
                onClick={() => {
                  navigateTo('orders');
                  setIsAuthOpen(false);
                }}
                style={{
                  padding: '0.85rem',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShoppingBag size={18} /> VIEW MY ORDERS
              </button>
            )}

            <button
              onClick={() => {
                logoutUser();
                setIsAuthOpen(false);
              }}
              style={{
                padding: '0.75rem',
                backgroundColor: '#ffffff',
                color: '#dc2626',
                border: '1px solid #dc2626',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                marginTop: '0.25rem'
              }}
            >
              <LogOut size={16} /> LOGOUT ACCOUNT
            </button>
          </div>
        ) : (
          /* LOGGED OUT LOGIN / REGISTER FORM */
          <>
            {/* Error Alert */}
            {errorMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: 'var(--radius-sm)',
                  color: '#991b1b',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
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
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '1.5rem'
              }}
            >
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  border: 'none',
                  borderBottom: mode === 'login' ? '2px solid #000000' : '2px solid transparent',
                  background: 'transparent',
                  fontWeight: mode === 'login' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                LOGIN
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  border: 'none',
                  borderBottom: mode === 'register' ? '2px solid #000000' : '2px solid transparent',
                  background: 'transparent',
                  fontWeight: mode === 'register' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                REGISTER
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                    FULL NAME
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.4rem',
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
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                  EMAIL ADDRESS
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.4rem',
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
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                    PHONE NUMBER
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.4rem',
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
                  marginTop: '0.5rem',
                  padding: '0.85rem',
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

            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {mode === 'login' ? (
                <p>
                  Demo Admin: <strong>admin@goodlucksociety.in</strong> (pass: <strong>admin123</strong>)
                </p>
              ) : (
                <p>By signing up you agree to Good Luck Society terms and privacy policies.</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};
