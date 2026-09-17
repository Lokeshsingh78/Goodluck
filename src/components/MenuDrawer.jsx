import React from 'react';
import { X, ChevronRight, ShoppingBag, Info, HelpCircle, FileText, User, Shield, LogOut } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const MenuDrawer = () => {
  const { isMenuOpen, setIsMenuOpen, navigateTo, userToken, user, setIsAuthOpen, logoutUser } = useShop();

  if (!isMenuOpen) return null;

  return (
    <>
      <div
        className={`menu-overlay ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div className={`menu-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-drawer-header">
          <span style={{ fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase' }}>
            MENU
          </span>
          <button className="icon-btn" onClick={() => setIsMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="menu-drawer-nav">
          <button
            className="menu-drawer-link"
            onClick={() => navigateTo('home')}
          >
            <span>HOME</span>
            <ChevronRight size={18} />
          </button>

          <button
            className="menu-drawer-link"
            onClick={() => navigateTo('catalog')}
          >
            <span>ALL T-SHIRTS</span>
            <ChevronRight size={18} />
          </button>

          <button
            className="menu-drawer-link"
            onClick={() => navigateTo('search')}
          >
            <span>SEARCH STORE</span>
            <ChevronRight size={18} />
          </button>

          {user?.role === 'admin' ? (
            <button
              className="menu-drawer-link"
              onClick={() => {
                setIsMenuOpen(false);
                navigateTo('admin');
              }}
              style={{ fontWeight: 800 }}
            >
              <span>ADMIN CONTROL PANEL</span>
              <ChevronRight size={18} />
            </button>
          ) : userToken ? (
            <button
              className="menu-drawer-link"
              onClick={() => {
                setIsMenuOpen(false);
                navigateTo('orders');
              }}
            >
              <span>MY ACCOUNT & ORDERS</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              className="menu-drawer-link"
              onClick={() => {
                setIsMenuOpen(false);
                navigateTo('login');
              }}
            >
              <span>SIGN IN / REGISTER</span>
              <ChevronRight size={18} />
            </button>
          )}

          <button
            className="menu-drawer-link"
            onClick={() => navigateTo('about')}
          >
            <span>ABOUT US</span>
            <ChevronRight size={18} />
          </button>

          <button
            className="menu-drawer-link"
            onClick={() => navigateTo('returns')}
          >
            <span>RETURNS & EXCHANGE</span>
            <ChevronRight size={18} />
          </button>

          <button
            className="menu-drawer-link"
            onClick={() => navigateTo('shipping')}
          >
            <span>SHIPPING POLICY</span>
            <ChevronRight size={18} />
          </button>

          <button
            className="menu-drawer-link"
            onClick={() => navigateTo('privacy')}
          >
            <span>DATA PROTECTION</span>
            <ChevronRight size={18} />
          </button>

          <button
            className="menu-drawer-link"
            onClick={() => navigateTo('imprint')}
          >
            <span>IMPRINT / LEGAL</span>
            <ChevronRight size={18} />
          </button>
        </nav>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          {userToken && (
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Signed in as {user?.name}</span>
              <button
                onClick={() => {
                  logoutUser();
                  setIsMenuOpen(false);
                }}
                style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                LOGOUT
              </button>
            </div>
          )}
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Good Luck Society &copy; 2026
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
            High-density statement clothing engineered in India.
          </p>
        </div>
      </div>
    </>
  );
};
