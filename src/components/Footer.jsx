import React from 'react';
import { ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { LANGUAGES } from '../data/products';

// SVG Icons for all social platforms
const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.44 6.337 6.337 0 0 0 .97 8.236 6.33 6.33 0 0 0 8.04 0c1.554-1.282 2.45-3.195 2.45-5.203V8.878a8.212 8.212 0 0 0 4.67 1.442V6.87a4.786 4.786 0 0 1-1.501-.184z" />
  </svg>
);

const PinterestIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
  </svg>
);

const SnapchatIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.007 2c-4.103 0-6.995 2.932-6.995 6.096 0 1.258.468 2.378 1.155 3.167.147.168.172.261.081.428-.109.201-.354.721-.572 1.169-.092.188-.239.26-.456.195-.718-.216-1.574-.403-2.188-.403-.642 0-1.12.213-1.44.644-.366.491-.184 1.282.529 1.706.772.46 1.83.693 2.845.86.326.054.498.178.502.434.015.867.751 1.547 1.637 1.516.326-.011.642-.099 1.018-.266.398-.178.687-.214.931-.059.508.322 1.488 1.493 2.953 1.493 1.465 0 2.445-1.171 2.953-1.493.244-.155.533-.119.931.059.376.167.692.255 1.018.266.886.031 1.622-.649 1.637-1.516.004-.256.176-.38.502-.434 1.015-.167 2.073-.4 2.845-.86.713-.424.895-1.215.529-1.706-.32-.431-.798-.644-1.44-.644-.614 0-1.47.187-2.188.403-.217.065-.364-.007-.456-.195-.218-.448-.463-.968-.572-1.169-.091-.167-.066-.26.081-.428.687-.789 1.155-1.909 1.155-3.167C19.002 4.932 16.11 2 12.007 2z" />
  </svg>
);

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TelegramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

const ThreadsIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24.004c-3.179 0-5.772-.858-7.709-2.552-1.937-1.694-2.905-4.048-2.905-6.997 0-3.084 1.042-5.542 3.125-7.374C6.78 5.25 9.615 4.333 13.203 4.333c1.785 0 3.398.243 4.839.73 1.44.486 2.628 1.189 3.564 2.108l-2.022 2.27c-.773-.746-1.704-1.307-2.793-1.684-1.089-.377-2.298-.565-3.627-.565-2.651 0-4.664.67-6.038 2.01-1.374 1.34-2.061 3.235-2.061 5.684 0 2.302.663 4.093 1.989 5.373 1.326 1.28 3.228 1.92 5.706 1.92 2.478 0 4.295-.623 5.45-1.87 1.156-1.246 1.637-2.923 1.444-5.03-.09-1.033-.36-1.897-.81-2.593-.45-.696-1.08-1.21-1.89-1.543-.81-.333-1.782-.5-2.916-.5-1.395 0-2.484.343-3.267 1.028-.783.686-1.175 1.583-1.175 2.69 0 .855.27 1.54.81 2.056.54.516 1.278.774 2.214.774 1.152 0 2.061-.419 2.727-1.256l1.84 1.84c-1.152 1.44-2.754 2.16-4.806 2.16-1.782 0-3.213-.536-4.293-1.608-1.08-1.072-1.62-2.479-1.62-4.222 0-1.782.576-3.24 1.728-4.374 1.152-1.134 2.718-1.701 4.698-1.701 1.764 0 3.33.342 4.698 1.026 1.368.684 2.412 1.647 3.132 2.889.72 1.242 1.08 2.691 1.08 4.347 0 2.898-.828 5.256-2.484 7.074-1.656 1.818-4.014 2.727-7.074 2.727z" />
  </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// SOCIAL MEDIA ACCOUNTS LIST
// -------------------------------------------------------------
// TO UPDATE WITH YOUR REAL HANDLES / USERNAMES:
// Replace "YOUR_INSTAGRAM_USERNAME", "YOUR_FACEBOOK_USERNAME", etc.
// with your actual social media handles or profile links.
// -------------------------------------------------------------
const SOCIAL_ACCOUNTS = [
  { name: 'Instagram', placeholder: '@your_username', url: 'https://instagram.com/YOUR_INSTAGRAM_USERNAME', icon: InstagramIcon, color: '#E4405F' },
  { name: 'Facebook', placeholder: 'your_username', url: 'https://facebook.com/YOUR_FACEBOOK_USERNAME', icon: FacebookIcon, color: '#1877F2' },
  { name: 'X (Twitter)', placeholder: '@your_username', url: 'https://x.com/YOUR_X_USERNAME', icon: XIcon, color: '#FFFFFF' },
  { name: 'YouTube', placeholder: '@your_channel', url: 'https://youtube.com/@YOUR_YOUTUBE_HANDLE', icon: YoutubeIcon, color: '#FF0000' },
];

export const Footer = () => {
  const { navigateTo, language, setLanguage } = useShop();

  return (
    <footer className="footer">
      <div className="container footer-container-inner">
        <div className="footer-grid">
          {/* Col 1: Brand */}
          <div className="footer-col">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              GOOD LUCK <span style={{ background: '#fff', color: '#000', padding: '0 0.3rem', borderRadius: '3px' }}>SOCIETY</span>
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#a1a1aa', marginBottom: '1rem', lineHeight: 1.6 }}>
              Clothing with something to say. Premium 200g organic cotton statement tees for people who don't mind being noticed.
            </p>

            {/* Social Media Links */}
            <div style={{ marginTop: '1.2rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {SOCIAL_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <a
                      key={acc.name}
                      href={acc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={acc.name}
                      title={acc.name}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#18181b',
                        border: '1px solid #3f3f46',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = acc.color;
                        e.currentTarget.style.borderColor = acc.color;
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#18181b';
                        e.currentTarget.style.borderColor = '#3f3f46';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="footer-col footer-col-shop">
            <h4>SHOP</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="#tshirts"
                  className="footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('catalog', 'ALL');
                  }}
                >
                  All T-Shirts
                </a>
              </li>
              <li>
                <a
                  href="#popular"
                  className="footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('catalog', 'BESTSELLERS');
                  }}
                >
                  Best Sellers
                </a>
              </li>
              <li>
                <a
                  href="#new"
                  className="footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('catalog', 'POPULAR');
                  }}
                >
                  Popular
                </a>
              </li>
              <li>
                <a href="#about" className="footer-link" onClick={() => navigateTo('about')}>
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Support */}
          <div className="footer-col footer-col-legal">
            <h4>LEGAL & INFO</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="#returns"
                  className="footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('returns');
                  }}
                >
                  Returns & Exchange
                </a>
              </li>
              <li>
                <a
                  href="#shipping"
                  className="footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('shipping');
                  }}
                >
                  Shipping Policy
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('privacy');
                  }}
                >
                  Data Protection
                </a>
              </li>
              <li>
                <a
                  href="#imprint"
                  className="footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('imprint');
                  }}
                >
                  Imprint / Legal Notice
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('terms');
                  }}
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Language & Guarantee */}
          <div className="footer-col footer-col-region">
            <h4>REGION & LANGUAGE</h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #3f3f46',
                    background: language.code === lang.code ? '#ffffff' : '#18181b',
                    color: language.code === lang.code ? '#000000' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#a1a1aa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="#edffa7" /> 100% Secure Checkout
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={16} color="#edffa7" /> Fast DHL Tracked Shipping
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={16} color="#edffa7" /> 14 Days Free Return
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: 0 }}>&copy; {new Date().getFullYear()} Good Luck Society. All rights reserved.</p>
          <div className="footer-payments-wrapper">
            {/* VISA */}
            <div style={{ background: '#1434CB', borderRadius: '3px', padding: '2px 7px', display: 'flex', alignItems: 'center', height: '22px' }} title="Visa">
              <span style={{ color: '#ffffff', fontWeight: 900, fontStyle: 'italic', fontSize: '0.72rem', letterSpacing: '0.5px', fontFamily: 'sans-serif' }}>VISA</span>
            </div>
            {/* Mastercard */}
            <div style={{ background: '#1E1E1E', border: '1px solid #333', borderRadius: '3px', padding: '2px 7px', display: 'flex', alignItems: 'center', height: '22px' }} title="Mastercard">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EB001B', display: 'inline-block' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F79E1B', display: 'inline-block', marginLeft: '-4px', opacity: 0.9 }}></span>
              </div>
            </div>
            {/* GPay */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '3px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '2px', height: '22px' }} title="Google Pay">
              <span style={{ fontWeight: 800, fontSize: '0.7rem', color: '#4285F4' }}>G</span>
              <span style={{ fontWeight: 700, fontSize: '0.7rem', color: '#5f6368' }}>Pay</span>
            </div>
            {/* PayPal */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '3px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '1px', height: '22px' }} title="PayPal">
              <span style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '0.72rem', color: '#003087' }}>Pay</span>
              <span style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '0.72rem', color: '#009CDE' }}>Pal</span>
            </div>
            {/* UPI */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '3px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '2px', height: '22px' }} title="UPI">
              <span style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '0.68rem', color: '#0f766e' }}>UPI</span>
              <span style={{ color: '#16a34a', fontWeight: 900, fontSize: '0.55rem' }}>▶</span>
            </div>
            {/* Apple Pay */}
            <div style={{ background: '#000000', border: '1px solid #333', borderRadius: '3px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '3px', height: '22px' }} title="Apple Pay">
              <svg width="9" height="11" viewBox="0 0 170 170" fill="#ffffff" style={{ marginBottom: '1px' }}>
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.07-3.67-2.92-7.66-7.7-11.96-14.34-6.8-10.45-12.06-21.94-15.78-34.47-3.72-12.53-5.58-24.36-5.58-35.49 0-14.73 3.66-26.69 10.99-35.88 7.33-9.19 16.59-13.88 27.78-14.07 4.7 0 9.87 1.15 15.51 3.44 5.64 2.29 9.53 3.44 11.66 3.44 1.77 0 5.75-1.25 11.96-3.75 6.2-2.5 11.39-3.65 15.57-3.44 12.16.82 21.68 5.6 28.56 14.34-10.74 6.49-16.01 15.48-15.8 26.98.21 9.07 3.73 16.66 10.57 22.77 6.84 6.1 14.8 9.57 23.88 10.4-2.4 7.02-5.46 13.82-9.18 20.4zM119.22 31.84c0-6.84 2.5-13.5 7.5-19.98 5-6.48 11.3-10.48 18.9-12 0.22 1.48.33 2.85.33 4.12 0 6.94-2.58 13.67-7.75 20.19-5.17 6.52-11.53 10.37-19.08 11.56-.22-1.27-.33-2.56-.33-3.89z" />
              </svg>
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.7rem' }}>Pay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
