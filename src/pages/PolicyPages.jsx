import React from 'react';
import { ArrowLeft, MapPin, Mail, Phone, Clock, FileText, ShieldCheck, Building } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useShop } from '../context/ShopContext';

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'What is the return policy for Good Luck Society t-shirts?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'We offer a 14-day hassle-free return policy. Goods must be unworn and in original condition with tags attached.'
      }
    },
    {
      '@type': 'Question',
      'name': 'What fabric is used in Good Luck Society statement tees?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'All of our oversized t-shirts are crafted from 200+ GSM 100% organic combed cotton with high-density screen printing.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Where is Good Luck Society located?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Good Luck Society headquarters and design studio are located in Malviya Industrial Area, Jaipur, Rajasthan 302017, India.'
      }
    }
  ]
};

export const PrivacyPage = () => {
  const { navigateTo } = useShop();

  return (
    <div className="section" style={{ minHeight: '80vh', paddingTop: '1.25rem' }}>
      <SEOHead
        title="Privacy Policy & Data Protection | Good Luck Society"
        description="Good Luck Society Privacy Policy. Read how we protect and process your personal information with full transparency and security."
        canonicalUrl="https://goodlucksociety.in/privacy"
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

        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span className="section-label">LEGAL & PRIVACY</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem' }}>
            DATA PROTECTION / PRIVACY POLICY
          </h1>
          <div style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>
            <p><strong>1. Privacy at a Glance</strong></p>
            <p>General information on what happens to your personal data when you visit our website. Personal data is all data with which you can be personally identified.</p>
            <br />
            <p><strong>2. Data Collection on Our Website</strong></p>
            <p>Data is collected when you provide it to us (e.g. newsletter sign-up, order process). Other data is collected automatically by our IT systems when visiting the website (e.g. browser, operating system, time of page request).</p>
            <br />
            <p><strong>3. Your Rights</strong></p>
            <p>You have the right at any time to receive information free of charge about the origin, recipient and purpose of your stored personal data. You also have a right to request the correction or deletion of this data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImprintPage = () => {
  const { navigateTo } = useShop();

  return (
    <div className="section" style={{ minHeight: '80vh', paddingTop: '1.25rem' }}>
      <SEOHead
        title="Imprint & Legal Notice | Good Luck Society Jaipur"
        description="Official legal notice, corporate registrations, and contact details for Good Luck Society India Pvt Ltd, Jaipur, Rajasthan."
        canonicalUrl="https://goodlucksociety.in/imprint"
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

        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span className="section-label">CORPORATE INFORMATION</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem' }}>
            IMPRINT / LEGAL NOTICE
          </h1>

          {/* Registered Headquarters */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              marginBottom: '2.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Building size={20} style={{ color: '#000000' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
                REGISTERED HEADQUARTERS
              </h3>
            </div>
            <p style={{ fontWeight: 700, color: '#000000', marginBottom: '0.4rem', fontSize: '1.05rem' }}>
              Good Luck Society India Pvt Ltd
            </p>
            <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              Plot No. 42-45, Malviya Industrial Area,<br />
              Near World Trade Park, Malviya Nagar,<br />
              Jaipur, Rajasthan 302017, India
            </p>
          </div>

          {/* Contact & Support Section */}
          <div
            style={{
              background: '#fafafa',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              marginBottom: '2.5rem'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              CUSTOMER CARE & CONTACT
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', color: '#000000', fontWeight: 700 }}>
                  <Mail size={16} /> <span>Email Support:</span>
                </div>
                <p style={{ color: '#555555', fontSize: '0.92rem', margin: 0 }}>support@goodlucksociety.in</p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', color: '#000000', fontWeight: 700 }}>
                  <Phone size={16} /> <span>Helpline / Hotline:</span>
                </div>
                <p style={{ color: '#555555', fontSize: '0.92rem', margin: 0 }}>+91 98290 12345 / +91 141 2789000</p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', color: '#000000', fontWeight: 700 }}>
                  <Clock size={16} /> <span>Working Hours:</span>
                </div>
                <p style={{ color: '#555555', fontSize: '0.92rem', margin: 0 }}>Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TermsPage = () => {
  const { navigateTo } = useShop();

  return (
    <div className="section" style={{ minHeight: '80vh', paddingTop: '1.25rem' }}>
      <SEOHead
        title="Terms of Service & FAQ | Good Luck Society"
        description="Terms of service, purchasing agreements, and FAQs for Good Luck Society online store orders."
        canonicalUrl="https://goodlucksociety.in/terms"
        structuredData={faqStructuredData}
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

        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span className="section-label">CUSTOMER AGREEMENT</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem' }}>
            TERMS OF SERVICE
          </h1>
          <div style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>
            <p><strong>1. Scope & Validity</strong></p>
            <p>These terms apply to all orders placed through the Good Luck Society online store.</p>
            <br />
            <p><strong>2. Contract Conclusion</strong></p>
            <p>The presentation of products in the online shop does not constitute a legally binding offer, but rather an invitation to order.</p>
            <br />
            <p><strong>3. Right of Withdrawal (14 Days)</strong></p>
            <p>Consumers have a 14-day right of withdrawal without giving reasons. Goods must be unworn with original tags attached.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReturnsPage = () => {
  const { navigateTo } = useShop();

  return (
    <div className="section" style={{ minHeight: '80vh', paddingTop: '1.25rem' }}>
      <SEOHead
        title="Returns & Exchange Policy | Good Luck Society"
        description="Easy 14-day return and exchange policy for Good Luck Society oversized t-shirts. Doorstep reverse pickup and quick refunds."
        canonicalUrl="https://goodlucksociety.in/returns"
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

        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span className="section-label">HASSLE-FREE PROCESS</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem' }}>
            RETURNS & EXCHANGE POLICY
          </h1>

          <div style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>
            <h3 style={{ color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              1. Eligibility Criteria for Returns & Exchanges
            </h3>
            <p>
              We want you to love your Good Luck Society apparel! To be eligible for a return or exchange, please ensure:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              <li>Item is unworn, unwashed, and undamaged.</li>
              <li>All original brand tags, labels, and packaging remain intact.</li>
              <li>The return/exchange request is raised within <strong>14 calendar days</strong> of receiving your package.</li>
            </ul>

            <h3 style={{ color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              2. How to Request a Return or Exchange
            </h3>
            <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              <li>Email our customer support at <strong>support@goodlucksociety.in</strong> or call <strong>+91 98290 12345</strong> with your Order ID.</li>
              <li>Specify whether you want a <strong>Size/Color Exchange</strong> or a <strong>Full Refund</strong>.</li>
              <li>Our team will schedule a doorstep reverse pickup via our logistics partner (BlueDart / Delhivery).</li>
              <li>Once picked up and inspected at our Jaipur warehouse, your replacement order or refund will be triggered immediately.</li>
            </ol>

            <h3 style={{ color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              3. Damaged or Defective Items
            </h3>
            <p>
              In the rare event that you receive a defective or damaged product, please contact us within 48 hours of delivery with photos/videos of the defect. We will immediately dispatch a brand-new replacement at no additional cost.
            </p>

            <h3 style={{ color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              4. Refunds & Mode of Payment
            </h3>
            <p>
              Prepaid orders will be refunded directly to the original payment source (Credit/Debit Card, Net Banking, UPI, or Wallet). COD orders will be refunded via UPI ID or direct bank transfer provided during the return request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShippingPage = () => {
  const { navigateTo } = useShop();

  return (
    <div className="section" style={{ minHeight: '80vh', paddingTop: '1.25rem' }}>
      <SEOHead
        title="Shipping & Delivery Policy | Good Luck Society"
        description="Fast nationwide shipping across India. Free delivery on orders above ₹999 with real-time order tracking."
        canonicalUrl="https://goodlucksociety.in/shipping"
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

        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span className="section-label">EXPRESS DELIVERY</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem' }}>
            SHIPPING & DELIVERY POLICY
          </h1>

          <div style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>
            <h3 style={{ color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              1. Shipping Charges & Thresholds
            </h3>
            <p>
              We strive to keep shipping fast, reliable, and transparent:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              <li><strong>Orders ₹999 & above:</strong> FREE Shipping across all pincodes in India.</li>
              <li><strong>Orders below ₹999:</strong> Flat shipping charge of ₹70 per order.</li>
              <li><strong>Cash on Delivery (COD):</strong> Nominal COD fee of ₹50 per order.</li>
            </ul>

            <h3 style={{ color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              2. Order Dispatch & Delivery Timelines
            </h3>
            <p>
              All orders are packed and dispatched from our Jaipur central warehouse within <strong>24 to 48 business hours</strong> of order placement (Monday through Saturday, excluding public holidays).
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              <li><strong>Metro Cities (Delhi, Mumbai, Bengaluru, etc.):</strong> 2 - 4 Business Days</li>
              <li><strong>Tier 2 & Tier 3 Cities:</strong> 3 - 5 Business Days</li>
              <li><strong>North East & Remote Pin Codes:</strong> 5 - 7 Business Days</li>
            </ul>

            <h3 style={{ color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              3. Courier Partners & Tracking
            </h3>
            <p>
              We partner with India's top courier logistics services including <strong>BlueDart, Delhivery, Xpressbees, and DHL Express</strong>. As soon as your order is shipped, you will receive an SMS, Email, and WhatsApp notification containing your direct Tracking AWB Number and courier link.
            </p>

            <h3 style={{ color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              4. Incorrect Address or Delivery Failures
            </h3>
            <p>
              Please double-check your shipping address and contact number before placing an order. In case of failed delivery due to incorrect contact details, our courier team will make up to 3 delivery attempts before returning the package to our warehouse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

