import React, { useState } from 'react';
import { Star, Eye, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { preloadImages } from '../utils/cacheUtils';

export const ProductCard = ({ product }) => {
  const { navigateToProduct, addToCart, formatPrice, toggleWishlist, isInWishlist } = useShop();
  const isWishlisted = isInWishlist(product.id);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleMouseEnter = () => {
    if (product?.imageBack) {
      preloadImages([product.imageBack]);
    }
  };

  return (
    <div className="product-card" onMouseEnter={handleMouseEnter}>
      {product.badge && <span className="product-card-badge">{product.badge}</span>}

      <button
        className="wishlist-toggle-btn"
        onClick={handleWishlistClick}
        aria-label="Add to Wishlist"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Heart size={16} fill={isWishlisted ? '#dc2626' : 'none'} color={isWishlisted ? '#dc2626' : '#000000'} />
      </button>

      <div
        className="product-card-image-wrap"
        onClick={() => navigateToProduct(product.id)}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={product.imageFront}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
          decoding="async"
        />

        {/* Hover Quote Preview */}
        <div className="quote-card-preview">
          <p className="quote-preview-text">"{product.quoteBack}"</p>
          <span className="view-details-pill">
            <Eye size={14} /> VIEW DETAILS
          </span>
        </div>
      </div>

      <div className="product-card-info">
        <div className="rating-row">
          <div style={{ display: 'flex', gap: '3px' }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={i < Math.floor(product.rating) ? '#edffa7' : 'none'}
                color="#edffa7"
              />
            ))}
          </div>
          <span className="rating-count">({product.reviewsCount})</span>
        </div>

        <h4
          className="product-card-title"
          onClick={() => navigateToProduct(product.id)}
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </h4>

        <div className="product-card-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <button
            className="quick-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 'M', 1);
            }}
          >
            + ADD
          </button>
        </div>
      </div>
    </div>
  );
};
