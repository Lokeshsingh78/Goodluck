import React, { useState, useEffect } from 'react';
import { Menu, ShoppingBag, ChevronDown, Flame, User, Search, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Header = () => {
  const {
    currentView,
    navigateTo,
    cart,
    setIsCartOpen,
    setIsSearchOpen,
    setIsMenuOpen,
    setIsAuthOpen,
    user,
    userToken,
    wishlist,
    showToast
  } = useShop();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Solid navbar on scroll down or on non-home pages
  const isSolid = scrolled || currentView !== 'home';

  const handleUserClick = () => {
    navigateTo('login');
  };

  return (
    <header className={`flat-navbar ${isSolid ? 'is-solid' : 'is-transparent'}`}>
      {/* Left: Logo Icon Badge & Brand Title */}
      <div className="flat-nav-left">
        <button
          className="flat-logo-badge"
          onClick={() => navigateTo('home')}
          aria-label="Home"
        >
          <Flame size={18} color="#000000" />
        </button>
        <a
          href="/"
          className="flat-brand-title"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('home');
          }}
        >
          GOOD LUCK <span className="highlight">SOCIETY</span>
        </a>
      </div>

      {/* Right: Text Navigation Links & Icons */}
      <div className="flat-nav-right">
        <nav className="flat-desktop-links">
          <button
            className={`flat-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => navigateTo('home')}
          >
            HOME
          </button>
          <button
            className={`flat-link ${currentView === 'catalog' ? 'active' : ''}`}
            onClick={() => navigateTo('catalog')}
          >
            CATALOG
          </button>
          <button
            className={`flat-link ${currentView === 'about' ? 'active' : ''}`}
            onClick={() => navigateTo('about')}
          >
            ABOUT
          </button>
        </nav>

        {/* Search Action Icon (Hidden on Mobile - in Bottom Bar) */}
        <button
          className={`flat-icon-action hide-mobile ${currentView === 'search' ? 'active' : ''}`}
          onClick={() => navigateTo('search')}
          aria-label="Search store"
          title="Search T-Shirts"
        >
          <Search size={19} />
        </button>

        {/* Wishlist Action Icon (Hidden on Mobile - in Bottom Bar) */}
        {user?.role !== 'admin' && (
          <button
            className={`flat-icon-action hide-mobile ${currentView === 'wishlist' ? 'active' : ''}`}
            onClick={() => {
              if (userToken) {
                navigateTo('wishlist');
              } else {
                showToast('Please sign in to view your saved wishlist items');
                navigateTo('login');
              }
            }}
            aria-label="Wishlist"
            title="My Wishlist"
            style={{ position: 'relative' }}
          >
            <Heart size={19} color={wishlist?.length > 0 ? '#ef4444' : 'currentColor'} fill={wishlist?.length > 0 ? '#ef4444' : 'none'} />
            {wishlist?.length > 0 && (
              <span className="flat-cart-badge" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
                {wishlist.length}
              </span>
            )}
          </button>
        )}

        {/* Cart Action (Always Visible) */}
        {user?.role !== 'admin' && (
          <button
            className="flat-icon-action flat-cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart"
          >
            <ShoppingBag size={19} />
            {totalCartCount > 0 && (
              <span className="flat-cart-badge">{totalCartCount}</span>
            )}
          </button>
        )}

        {/* User Account Action Icon (Hidden on Mobile - in Bottom Bar) */}
        <button
          className={`flat-icon-action hide-mobile ${currentView === 'login' || currentView === 'orders' || currentView === 'admin' ? 'active' : ''}`}
          onClick={handleUserClick}
          aria-label="Account"
          title={userToken ? `Logged in as ${user?.name} (${user?.role})` : 'Login / Register'}
        >
          <User size={19} />
        </button>

        {/* Mobile Menu Trigger */}
        <button
          className="flat-icon-action flat-mobile-menu"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={19} />
        </button>
      </div>
    </header>
  );
};
