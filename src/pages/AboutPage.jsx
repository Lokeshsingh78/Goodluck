import React from 'react';
import { ArrowRight, ArrowLeft, ShieldCheck, Award, Sparkles, Flame, CheckCircle2, MapPin } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { SEOHead } from '../components/SEOHead';

export const AboutPage = () => {
  const { navigateTo } = useShop();

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'About Good Luck Society',
    'url': 'https://goodlucksociety.in/about',
    'description': 'Our Story & Mission: Clothing for people who say what others only think. Premium 200 GSM organic cotton oversized t-shirts screen printed in Jaipur, Rajasthan, India.'
  };

  const pillars = [
    {
      icon: <Award size={24} style={{ color: '#000000' }} />,
      title: '200 G/M² HEAVY COTTON',
      desc: 'Standard graphic tees shrink and turn flimsy. We use 200g organic combed cotton for a thick, structured boxy drape that holds its shape wash after wash.'
    },
    {
      icon: <MapPin size={24} style={{ color: '#000000' }} />,
      title: 'CRAFTED IN JAIPUR',
      desc: 'Screen printed in our Jaipur, Rajasthan studio using high-density premium screen inks engineered never to crack, peel, or fade.'
    },
    {
      icon: <Flame size={24} style={{ color: '#000000' }} />,
      title: 'UNAPOLOGETIC STATEMENTS',
      desc: 'Minimal front typography, maximum impact rear quotes. Built for individuals who set boundaries and own every room they walk into.'
    }
  ];

  return (
    <div className="section" style={{ minHeight: '80vh', paddingTop: '1.25rem' }}>
      <SEOHead
        title="Our Story & Mission | Good Luck Society Jaipur"
        description="Learn about Good Luck Society. We construct luxury heavyweight 200 g/m² organic cotton oversized tees in Jaipur, India for bold statement makers."
        keywords="Good Luck Society story, statement fashion brand Jaipur, organic cotton oversized tshirts, luxury heavyweight streetwear India"
        canonicalUrl="https://goodlucksociety.in/about"
        structuredData={aboutSchema}
      />
      <div className="container">
        {/* Back to Home Navigation Button */}
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

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Hero Header */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              className="section-label"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '0.75rem'
              }}
            >
              <Sparkles size={14} /> BRAND MANIFESTO & PHILOSOPHY
            </span>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                fontWeight: 900,
                textTransform: 'uppercase',
                marginBottom: '1rem',
                lineHeight: 1.08,
                letterSpacing: '-0.02em'
              }}
            >
              CLOTHES WITH SOMETHING TO SAY.
            </h1>
            <p
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                maxWidth: '700px',
                margin: '0 auto'
              }}
            >
              Good Luck Society makes clothing for people who don't always say what they're thinking — they wear it instead.
            </p>
          </div>

          {/* Featured Image Banner */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: '2.5rem',
              maxWidth: '720px',
              margin: '0 auto 2.5rem auto',
              maxHeight: '320px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
            }}
          >
            <img
              src="/images/hero_banner.png"
              alt="Good Luck Society Brand Philosophy"
              style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* 3 Pillars Grid */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="section-label">THE THREE STANDARDS</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
                WHY GOOD LUCK SOCIETY IS DIFFERENT
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem'
              }}
            >
              {pillars.map((p, i) => (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.75rem',
                    transition: 'var(--transition)'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#f4f4f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem'
                    }}
                  >
                    {p.icon}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>


          {/* CTA Banner */}
          <div
            style={{
              textAlign: 'center',
              background: '#ffffff',
              border: '2px solid #000000',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2rem'
            }}
          >
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              READY TO MAKE A STATEMENT?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', marginBottom: '1.75rem', maxWidth: '550px', margin: '0 auto 1.75rem auto' }}>
              Explore our complete collection of 200 GSM organic cotton statement oversized t-shirts with free express shipping across India.
            </p>
            <button
              className="btn-primary btn-dark"
              onClick={() => navigateTo('catalog')}
              style={{
                padding: '0.85rem 2rem',
                fontSize: '0.9rem',
                letterSpacing: '0.06em'
              }}
            >
              SHOP THE FULL COLLECTION <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
