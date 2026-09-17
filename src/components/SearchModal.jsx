import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, products, navigateToProduct, formatPrice } = useShop();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const handleClose = () => {
    setIsSearchOpen(false);
    setQuery('');
  };

  const filteredProducts = products.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.quoteBack?.toLowerCase().includes(q) ||
      p.quoteFront?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.tag?.toLowerCase().includes(q) ||
      p.badge?.toLowerCase().includes(q)
    );
  });

  const popularSearches = [
    'MY MAN',
    "DON'T TALK",
    'CRAZY BOYFRIEND',
    'ZERO APOLOGIES',
    'STAY OUT OF MY WAY'
  ];

  return (
    <div
      className="search-modal-backdrop"
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '3rem',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
    >
      <div
        className="search-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '85vh',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: '#fafafa'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} style={{ color: '#000000' }} />
            <span
              style={{
                fontWeight: 800,
                fontSize: '1.05rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              SEARCH STORE
            </span>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close search"
            style={{
              padding: '0.4rem',
              borderRadius: '50%',
              border: 'none',
              background: '#f4f4f5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={20} color="#000000" />
          </button>
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1.25rem 1.5rem 0.75rem 1.5rem' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '1rem',
                color: '#71717a'
              }}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search T-shirts, statement quotes (e.g. My Man, Don't Talk)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 2.8rem 0.85rem 2.8rem',
                borderRadius: 'var(--radius-full)',
                border: '2px solid #000000',
                outline: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                background: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search query"
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  padding: '0.25rem',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#e4e4e7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={14} color="#000000" />
              </button>
            )}
          </div>

          {/* Quick Suggestion Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#a1a1aa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              POPULAR:
            </span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #e4e4e7',
                  background: query === term ? '#000000' : '#f4f4f5',
                  color: query === term ? '#ffffff' : '#27272a',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div
          style={{
            padding: '0.5rem 1.5rem',
            background: '#fafafa',
            borderTop: '1px solid #f4f4f5',
            borderBottom: '1px solid #f4f4f5',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#71717a',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {query.trim()
            ? `FOUND ${filteredProducts.length} STATEMENT TEE${filteredProducts.length === 1 ? '' : 'S'} FOR "${query}"`
            : `ALL ${filteredProducts.length} STATEMENT TEES IN CATALOG`}
        </div>

        {/* Results List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => {
                navigateToProduct(product.id);
                handleClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#000000';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={product.imageFront || product.image}
                  alt={product.name}
                  style={{
                    width: '56px',
                    height: '70px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    background: '#f4f4f5'
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <h5
                      style={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#000000',
                        margin: 0
                      }}
                    >
                      {product.name}
                    </h5>
                    {product.badge && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          background: '#000000',
                          color: '#ffffff',
                          textTransform: 'uppercase'
                        }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: '#71717a',
                      fontWeight: 500,
                      margin: '0 0 0.25rem 0'
                    }}
                  >
                    "{product.quoteBack || product.name}"
                  </p>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: '#000000'
                    }}
                  >
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#000000'
                }}
              >
                <span>VIEW</span>
                <ArrowRight size={16} />
              </div>
            </div>
          ))}

          {query.trim() && filteredProducts.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem'
              }}
            >
              <Tag size={32} style={{ color: '#a1a1aa', marginBottom: '0.75rem' }} />
              <h4 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                NO TEES MATCHED "{query}"
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: '1.25rem' }}>
                Try searching for quotes like "Don't Talk", "Crazy Boyfriend", or "Bestseller".
              </p>
              <button
                onClick={() => setQuery('')}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #000000',
                  background: '#000000',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                CLEAR SEARCH
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
