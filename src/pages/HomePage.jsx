import React from 'react';
import { ArrowRight, Check, Award, Flame, Star, Shield, Sparkles, RefreshCw, Zap, Compass } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { FAQAccordion } from '../components/FAQAccordion';
import { MarqueeTicker } from '../components/MarqueeTicker';
import { CommunityQualitySection } from '../components/CommunityQualitySection';
import { REVIEWS } from '../data/products';
import { SEOHead } from '../components/SEOHead';

export const HomePage = () => {
  const { products, navigateTo, navigateToProduct } = useShop();

  const featuredProducts = products.slice(0, 4);

  const homeStructuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Good Luck Society',
      'url': 'https://goodlucksociety.in',
      'logo': 'https://goodlucksociety.in/images/better_tshirt.png',
      'description': 'Statement fashion and heavyweight organic cotton oversized streetwear brand based in Mumbai, India.',
      'sameAs': [
        'https://instagram.com/goodlucksociety',
        'https://facebook.com/goodlucksociety'
      ],
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+91-9876543210',
        'contactType': 'customer service',
        'areaServed': 'IN',
        'availableLanguage': ['en', 'hi']
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Good Luck Society',
      'url': 'https://goodlucksociety.in',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://goodlucksociety.in/catalog?search={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  ];

  return (
    <div className="home-page">
      <SEOHead
        title="Good Luck Society | Premium Oversized T-Shirts & Heavyweight Streetwear"
        description="Shop India's leading statement streetwear brand. Premium 240+ GSM organic cotton oversized t-shirts with bold rear print statement quotes."
        keywords="oversized t-shirts India, statement streetwear, heavy cotton oversized tees, Good Luck Society clothing, luxury Mumbai fashion, unisex t-shirts"
        canonicalUrl="https://goodlucksociety.in"
        structuredData={homeStructuredData}
      />
      {/* Hero Section */}
      <section className="hero-section">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero-bg-video"
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay" />

        <div className="hero-content">
          <h1 className="hero-title hero-title-animated">
            CLOTHES WITH SOMETHING TO SAY.
          </h1>
          <p className="hero-subtitle hero-subtitle-animated">
            Bold statements for people who don't mind being noticed.
          </p>

          <div className="hero-cta-animated" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-hero-cta"
              onClick={() => navigateTo('catalog')}
            >
              <span>SHOP THE STATEMENTS</span>
              <ArrowRight size={18} className="cta-arrow-icon" />
            </button>
          </div>
        </div>

        {/* Minimal Scroll Indicator */}
        <div
          className="hero-scroll-indicator"
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
        >
          <span className="scroll-indicator-text">SCROLL TO EXPLORE</span>
          <div className="scroll-indicator-mouse">
            <span className="scroll-indicator-dot" />
          </div>
        </div>

        {/* Floating Marquee Ticker at the bottom of Hero Section */}
        <MarqueeTicker
          text="⚡ CLOTHES WITH SOMETHING TO SAY 🔥 BOLD STATEMENTS FOR THE BOLD 📦 FREE SHIPPING OVER ₹999 🇮🇳 HIGH-DENSITY PRINT 🏆 GOOD LUCK SOCIETY"
          bg="rgba(0, 0, 0, 0.7)"
          color="#ffffff"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 5,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderBottom: 'none'
          }}
        />
      </section>

      {/* Feature Highlights Bar */}
      <div className="feature-highlights">
        <div className="container">
          <div className="feature-grid">
            <div className="feature-item">
              <Award size={18} color="#edffa7" />
              <span>200 G/M² HEAVYWEIGHT COTTON</span>
            </div>
            <div className="feature-item">
              <Sparkles size={18} color="#edffa7" />
              <span>INDIAN HIGH-DENSITY PRINT</span>
            </div>
            <div className="feature-item">
              <Flame size={18} color="#edffa7" />
              <span>SIGNATURE OVERSIZED FIT</span>
            </div>
            <div className="feature-item">
              <RefreshCw size={18} color="#edffa7" />
              <span>14 DAYS EASY RETURNS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Bestsellers Section */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-label">POPULAR RELEASES</span>
            <h2 className="section-title">STATEMENTS PEOPLE WILL REMEMBER</h2>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              className="btn-primary btn-dark"
              onClick={() => navigateTo('catalog')}
            >
              EXPLORE ALL STATEMENT TEES <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>





      {/* Community Moveable Slider & Quality Feature Section */}
      <CommunityQualitySection />

      {/* Customer Reviews Section */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-label">COMMUNITY FEEDBACK</span>
            <h2 className="section-title">STATEMENTS IN THE WILD</h2>
          </div>

          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                style={{
                  background: '#f9f9f9',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#000000' }}>
                  "{rev.title}"
                </h5>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {rev.comment}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 700 }}>{rev.author}</span>
                  <span style={{ color: 'var(--text-light)' }}>Verified Buyer</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <FAQAccordion />
    </div>
  );
};
