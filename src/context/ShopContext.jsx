import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CURRENCIES, LANGUAGES } from '../data/products';
import { getLocalCache, setLocalCache, preloadImages } from '../utils/cacheUtils';
import { getApiUrl } from '../config/api';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'catalog' | 'product' | 'about' | 'privacy' | 'imprint' | 'terms' | 'admin' | 'orders'
  const [catalogFilter, setCatalogFilter] = useState('ALL');
  const [selectedProductId, setSelectedProductId] = useState('my-man-oversized-t-shirt');
  const [productsList, setProductsList] = useState(() => {
    const cached = getLocalCache('products_catalog');
    if (cached && Array.isArray(cached.data) && cached.data.length >= PRODUCTS.length) {
      return cached.data;
    }
    return PRODUCTS;
  });
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // User Auth & Wishlist State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('goodluck_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [userToken, setUserToken] = useState(() => {
    return localStorage.getItem('goodluck_token') || null;
  });
  const [wishlist, setWishlist] = useState([]);

  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [toastMessage, setToastMessage] = useState('');

  // Toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Fetch products from backend API on mount (Stale-While-Revalidate pattern)
  useEffect(() => {
    fetchProducts();
  }, []);

  // Preload catalog images whenever productsList updates
  useEffect(() => {
    if (Array.isArray(productsList)) {
      const imageUrls = productsList.flatMap((p) => [
        p.imageFront || p.image,
        p.imageBack
      ]).filter(Boolean);
      preloadImages(imageUrls.slice(0, 16)); // Preload top 16 product images
    }
  }, [productsList]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(getApiUrl('/api/products'));
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          // If DB products list is missing any standard products, merge fallback catalog
          let finalProducts = data.products;
          if (finalProducts.length < PRODUCTS.length) {
            const existingIds = new Set(finalProducts.map(p => p.id));
            const missing = PRODUCTS.filter(p => !existingIds.has(p.id));
            finalProducts = [...finalProducts, ...missing];
          }
          setProductsList(finalProducts);
          setLocalCache('products_catalog', finalProducts, 600); // 10 minutes cache
        }
      }
    } catch (err) {
      console.log('Using cached or fallback products catalog');
    }
  };

  // Check auth user status & fetch wishlist on load
  useEffect(() => {
    if (userToken) {
      fetchCurrentUser();
      fetchUserCart();
      fetchUserWishlist();
    } else {
      setWishlist([]);
    }
  }, [userToken]);

  const fetchUserWishlist = async () => {
    if (!userToken) return;
    try {
      const res = await fetch(getApiUrl('/api/wishlist'), {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlist(data.wishlist || []);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  const toggleWishlist = async (product) => {
    if (!userToken) {
      showToast('Please sign in or register to save wishlist items.');
      setIsAuthOpen(false);
      navigateTo('login');
      return;
    }

    const productId = typeof product === 'string' ? product : product.id;
    const isAlreadyWishlisted = wishlist.some((item) => item.id === productId);

    if (isAlreadyWishlisted) {
      setWishlist((prev) => prev.filter((item) => item.id !== productId));
      showToast('Removed from your wishlist.');
    } else {
      const targetProd = typeof product === 'object' ? product : productsList.find((p) => p.id === productId);
      if (targetProd) {
        setWishlist((prev) => [targetProd, ...prev]);
      }
      showToast('Added to your wishlist! ❤️');
    }

    try {
      const res = await fetch(getApiUrl('/api/wishlist/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        fetchUserWishlist();
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(getApiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('goodluck_user', JSON.stringify(data.user));
      } else {
        // Token invalid/expired
        logoutUser();
      }
    } catch (err) {
      // Offline fallback
    }
  };

  const fetchUserCart = async () => {
    try {
      const res = await fetch(getApiUrl('/api/cart'), {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cart) {
          setCart(data.cart);
        }
      }
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
  };

  // Login
  const loginUser = async (email, password) => {
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Login failed.' };
      }

      setUserToken(data.token);
      setUser(data.user);
      localStorage.setItem('goodluck_token', data.token);
      localStorage.setItem('goodluck_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { error: 'Network error during login.' };
    }
  };

  // Register
  const registerUser = async (userData) => {
    try {
      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Registration failed.' };
      }

      setUserToken(data.token);
      setUser(data.user);
      localStorage.setItem('goodluck_token', data.token);
      localStorage.setItem('goodluck_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { error: 'Network error during registration.' };
    }
  };

  // Logout
  const logoutUser = () => {
    setUser(null);
    setUserToken(null);
    localStorage.removeItem('goodluck_token');
    localStorage.removeItem('goodluck_user');
    showToast('Logged out successfully.');
  };

  // Add item to cart
  const addToCart = async (product, size = 'M', quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => (item.id === product.id || item.productId === product.id) && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const item = updated[existingIndex];
        updated[existingIndex] = {
          ...item,
          quantity: item.quantity + quantity
        };
        return updated;
      }

      return [
        ...prevCart,
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.imageFront || product.image,
          size: size,
          quantity: quantity,
          quoteBack: product.quoteBack
        }
      ];
    });

    if (userToken) {
      try {
        await fetch(getApiUrl('/api/cart'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`
          },
          body: JSON.stringify({ productId: product.id, size, quantity })
        });
      } catch (e) {}
    }

    showToast(`Added ${product.name} (${size}) to cart!`);
  };

  // Update item quantity
  const updateQuantity = async (id, size, delta) => {
    let targetQty = 0;
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id && item.size === size) {
            const newQty = item.quantity + delta;
            targetQty = newQty;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });

    if (userToken) {
      try {
        await fetch(getApiUrl('/api/cart'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`
          },
          body: JSON.stringify({ productId: id, size, quantity: targetQty })
        });
      } catch (e) {}
    }
  };

  // Remove item from cart
  const removeFromCart = async (id, size) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.size === size)));

    if (userToken) {
      try {
        await fetch(getApiUrl(`/api/cart/${id}/${size}`), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${userToken}` }
        });
      } catch (e) {}
    }
  };

  // Clear cart
  const clearCart = async () => {
    setCart([]);
    if (userToken) {
      try {
        await fetch(getApiUrl('/api/cart/clear'), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${userToken}` }
        });
      } catch (e) {}
    }
  };

  // Promo Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const applyCoupon = (code) => {
    if (!code) return { error: 'Please enter a coupon code.' };
    const clean = code.trim().toUpperCase();
    if (clean === 'GOODLUCK10') {
      const coupon = { code: 'GOODLUCK10', discountType: 'percent', value: 10, label: '10% OFF' };
      setAppliedCoupon(coupon);
      showToast('Coupon GOODLUCK10 applied! 10% discount added.');
      return { success: true };
    } else if (clean === 'WELCOME15') {
      const coupon = { code: 'WELCOME15', discountType: 'percent', value: 15, label: '15% OFF' };
      setAppliedCoupon(coupon);
      showToast('Coupon WELCOME15 applied! 15% discount added.');
      return { success: true };
    } else if (clean === 'STREET200') {
      const coupon = { code: 'STREET200', discountType: 'flat', value: 200, label: '₹200 OFF' };
      setAppliedCoupon(coupon);
      showToast('Coupon STREET200 applied! ₹200 discount added.');
      return { success: true };
    } else {
      return { error: 'Invalid coupon code. Try "GOODLUCK10" or "WELCOME15".' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.');
  };

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem('goodluck_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  });

  const addRecentlyViewed = (productId) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, 6);
      localStorage.setItem('goodluck_recently_viewed', JSON.stringify(updated));
      return updated;
    });
  };

  // Customer Reviews State
  const [productReviews, setProductReviews] = useState({});

  const addProductReview = (productId, reviewData) => {
    setProductReviews((prev) => {
      const currentReviews = prev[productId] || [];
      const updated = [
        {
          id: Date.now(),
          author: reviewData.author || 'Verified Buyer',
          rating: Number(reviewData.rating) || 5,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          title: reviewData.title,
          comment: reviewData.comment,
          verified: true
        },
        ...currentReviews
      ];
      return { ...prev, [productId]: updated };
    });
    showToast('Thank you! Your review has been submitted.');
  };

  // Calculate cart subtotal & discount
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percent') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.discountType === 'flat') {
      discountAmount = Math.min(cartSubtotal, appliedCoupon.value);
    }
  }

  const cartGrandTotal = Math.max(0, cartSubtotal - discountAmount);

  // Navigate to product detail
  const navigateToProduct = (productId) => {
    setSelectedProductId(productId);
    addRecentlyViewed(productId);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to page view with optional filter for catalog
  const navigateTo = (view, filterParam = null) => {
    if (view === 'catalog' && filterParam) {
      setCatalogFilter(filterParam);
    }
    setCurrentView(view);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format price
  const formatPrice = (price) => {
    return `₹${Math.round(price).toLocaleString('en-IN')}`;
  };

  return (
    <ShopContext.Provider
      value={{
        currentView,
        navigateTo,
        catalogFilter,
        setCatalogFilter,
        selectedProductId,
        navigateToProduct,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        cartGrandTotal,
        recentlyViewed,
        addRecentlyViewed,
        productReviews,
        addProductReview,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isMenuOpen,
        setIsMenuOpen,
        isAuthOpen,
        setIsAuthOpen,
        user,
        setUser,
        userToken,
        wishlist,
        toggleWishlist,
        isInWishlist,
        fetchUserWishlist,
        loginUser,
        registerUser,
        logoutUser,
        currency,
        setCurrency,
        language,
        setLanguage,
        formatPrice,
        toastMessage,
        showToast,
        products: productsList,
        fetchProducts
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
