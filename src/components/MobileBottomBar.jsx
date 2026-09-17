import React from 'react';
import { Home, Grid, Search, ShoppingBag, User, ShieldCheck, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const MobileBottomBar = () => {
  const {
    currentView,
    navigateTo,
    cart,
    setIsCartOpen,
    setIsSearchOpen,
    userToken,
    user,
    wishlist,
    showToast
  } = useShop();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="mobile-bottom-bar">
      <button
        className={`mobile-bar-item ${currentView === 'home' ? 'active' : ''}`}
        onClick={() => navigateTo('home')}
      >
        <Home size={20} />
        <span>HOME</span>
      </button>

      <button
        className={`mobile-bar-item ${currentView === 'catalog' ? 'active' : ''}`}
        onClick={() => navigateTo('catalog')}
      >
        <Grid size={20} />
        <span>CATALOG</span>
      </button>

      <button
        className={`mobile-bar-item ${currentView === 'search' ? 'active' : ''}`}
        onClick={() => navigateTo('search')}
      >
        <Search size={20} />
        <span>SEARCH</span>
      </button>

      <button
        className={`mobile-bar-item ${currentView === 'login' || currentView === 'orders' || currentView === 'admin' ? 'active' : ''}`}
        onClick={() => navigateTo('login')}
      >
        <User size={20} />
        <span>ACCOUNT</span>
      </button>

      {!isAdmin && (
        <button
          className={`mobile-bar-item ${currentView === 'wishlist' ? 'active' : ''}`}
          onClick={() => {
            if (userToken) {
              navigateTo('wishlist');
            } else {
              showToast('Please sign in to view your wishlist');
              navigateTo('login');
            }
          }}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Heart size={20} color={wishlist?.length > 0 ? '#ef4444' : 'currentColor'} fill={wishlist?.length > 0 ? '#ef4444' : 'none'} />
            {wishlist?.length > 0 && <span className="mobile-cart-badge" style={{ backgroundColor: '#ef4444', color: '#fff' }}>{wishlist.length}</span>}
          </div>
          <span>WISHLIST</span>
        </button>
      )}

      {!isAdmin && (
        <button
          className="mobile-bar-item cart-btn-item"
          onClick={() => setIsCartOpen(true)}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <ShoppingBag size={20} />
            {totalCartCount > 0 && <span className="mobile-cart-badge">{totalCartCount}</span>}
          </div>
          <span>CART</span>
        </button>
      )}
    </div>
  );
};
