import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Filter } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { SEOHead } from '../components/SEOHead';

export const CatalogPage = () => {
  const { products, navigateTo, catalogFilter, setCatalogFilter } = useShop();
  const filter = catalogFilter || 'ALL';
  const setFilter = (newFilter) => setCatalogFilter(newFilter);

  const isBestseller = (p) =>
    p.badge?.toLowerCase() === 'bestseller' ||
    p.badge?.toLowerCase() === 'bestsellers';

  const isPopular = (p) =>
    p.badge?.toLowerCase() === 'popular';

  const counts = {
    ALL: products.length,
    BESTSELLERS: products.filter(isBestseller).length,
    POPULAR: products.filter(isPopular).length
  };

  const filteredProducts = products.filter((p) => {
    if (filter === 'BESTSELLERS') return isBestseller(p);
    if (filter === 'POPULAR') return isPopular(p);
    return true;
  });

  const SIZES_LIST = ['ALL', 'S', 'M', 'L', 'XL', 'XXL'];

  const catalogBreadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://goodlucksociety.in'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Catalog Collection',
        'item': 'https://goodlucksociety.in/catalog'
      }
    ]
  };

  return (
    <div className="catalog-page section" style={{ minHeight: '80vh', paddingTop: '1.25rem' }}>
      <SEOHead
        title="Oversized T-Shirts Catalog | Good Luck Society Streetwear"
        description="Browse the complete catalog of 240+ GSM organic cotton oversized t-shirts with high-contrast rear statement quotes. Free express shipping in India."
        keywords="oversized tees collection, statement quote tshirts, heavyweight cotton tees, unisex streetwear catalog, Good Luck Society products"
        canonicalUrl="https://goodlucksociety.in/catalog"
        structuredData={catalogBreadcrumbSchema}
      />
      <div className="container">
        {/* Back to Home Navigation Button */}
        <div style={{ marginBottom: '1rem' }}>
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

        <div className="section-title-wrap">
          <span className="section-label">THE FULL COLLECTION</span>
          <h2 className="section-title">ALL STATEMENT TEES</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Each T-shirt is crafted from 200g/m² organic cotton with high-contrast back statement prints.
          </p>
        </div>

        {/* Filter Bar: Category Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap'
          }}
        >
          {['ALL', 'BESTSELLERS', 'POPULAR'].map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.6rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: isActive ? '2px solid #000000' : '1px solid #d4d4d8',
                  background: isActive ? '#000000' : '#ffffff',
                  color: isActive ? '#ffffff' : '#18181b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{tab}</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    background: isActive ? '#ffffff' : '#f4f4f5',
                    color: isActive ? '#000000' : '#71717a'
                  }}
                >
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

