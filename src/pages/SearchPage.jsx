import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowLeft, Tag, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { SEOHead } from '../components/SEOHead';

export const SearchPage = () => {
  const { products, navigateTo } = useShop();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus input on mount
    inputRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  return (
    <div className="search-page section" style={{ minHeight: '85vh', paddingTop: '1.25rem' }}>
      <SEOHead
        title="Search Statement T-Shirts | Good Luck Society"
        description="Search through our premium catalog of 200 GSM organic cotton oversized t-shirts with high contrast statement prints."
      />
      <div className="container">
        {/* Back to Home Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigateTo('home')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: '#ffffff',
              color: '#000000',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} />
            <span>BACK TO HOME</span>
          </button>
        </div>

        {/* Search Header Banner */}
        <div className="section-title-wrap" style={{ marginBottom: '2rem' }}>
          <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} /> LIVE STORE SEARCH
          </span>
          <h2 className="section-title">SEARCH STATEMENT TEES</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Find your favorite quote, mood, or graphic statement oversized t-shirt instantly.
          </p>
        </div>

        {/* Large Prominent Search Bar */}
        <div
          style={{
            maxWidth: '780px',
            margin: '0 auto 2.5rem auto',
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              size={22}
              style={{
                position: 'absolute',
                left: '1.25rem',
                color: '#000000'
              }}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by quote, design, or keyword (e.g. My Man, Don't Talk, Crazy Boyfriend)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1.1rem 3.5rem 1.1rem 3.2rem',
                borderRadius: 'var(--radius-full)',
                border: '2px solid #000000',
                outline: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                background: '#ffffff',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease'
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '1.25rem',
                  padding: '0.35rem',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#e4e4e7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={16} color="#000000" />
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              background: '#fafafa',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <Tag size={40} style={{ color: '#a1a1aa', marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              NO TEES FOUND FOR "{query}"
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#71717a', marginBottom: '1.5rem' }}>
              Check your spelling or try searching for keywords like "Crazy", "Bestseller", "Don't Talk", or "My Man".
            </p>
            <button
              onClick={() => setQuery('')}
              style={{
                padding: '0.65rem 1.6rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: '#000000',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                letterSpacing: '0.04em'
              }}
            >
              CLEAR SEARCH & VIEW ALL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
