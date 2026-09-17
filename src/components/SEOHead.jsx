import { useEffect } from 'react';

const SITE_NAME = 'Good Luck Society';
const DEFAULT_DOMAIN = 'https://goodlucksociety.in';
const DEFAULT_OG_IMAGE = `${DEFAULT_DOMAIN}/images/better_tshirt.png`;
const DEFAULT_DESCRIPTION = 'Good Luck Society - Premium Oversized T-Shirts & Heavyweight Statement Streetwear in India. Express what others only think with heavyweight cotton statement tees.';
const DEFAULT_KEYWORDS = 'oversized t-shirts, statement tees, heavyweight cotton tshirts, Indian streetwear brand, luxury streetwear Mumbai, unisex oversized fashion, Good Luck Society';

export const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl = DEFAULT_DOMAIN,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  structuredData = null
}) => {
  useEffect(() => {
    // 1. Update Document Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Statement Fashion & Oversized Tees`;
    document.title = fullTitle;

    // Helper function to update or create meta tags
    const updateMetaTag = (selector, name, value, propertyAttr = 'name') => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(propertyAttr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // Helper function to update link tags
    const updateLinkTag = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // 2. Standard Meta Tags
    updateMetaTag('meta[name="description"]', 'description', description);
    updateMetaTag('meta[name="keywords"]', 'keywords', keywords);
    updateMetaTag('meta[name="robots"]', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('meta[name="author"]', 'author', SITE_NAME);

    // 3. Canonical Link Tag
    updateLinkTag('canonical', canonicalUrl);

    // 4. Open Graph Tags
    updateMetaTag('meta[property="og:site_name"]', 'og:site_name', SITE_NAME, 'property');
    updateMetaTag('meta[property="og:title"]', 'og:title', fullTitle, 'property');
    updateMetaTag('meta[property="og:description"]', 'og:description', description, 'property');
    updateMetaTag('meta[property="og:url"]', 'og:url', canonicalUrl, 'property');
    updateMetaTag('meta[property="og:type"]', 'og:type', ogType, 'property');
    updateMetaTag('meta[property="og:image"]', 'og:image', ogImage, 'property');
    updateMetaTag('meta[property="og:locale"]', 'og:locale', 'en_IN', 'property');

    // 5. Twitter Card Tags
    updateMetaTag('meta[name="twitter:card"]', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[name="twitter:site"]', 'twitter:site', '@goodlucksociety');
    updateMetaTag('meta[name="twitter:title"]', 'twitter:title', fullTitle);
    updateMetaTag('meta[name="twitter:description"]', 'twitter:description', description);
    updateMetaTag('meta[name="twitter:image"]', 'twitter:image', ogImage);

    // 6. JSON-LD Structured Data Schema Injection
    let scriptEl = document.querySelector('script[id="json-ld-schema"]');
    if (structuredData) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.setAttribute('id', 'json-ld-schema');
        scriptEl.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(structuredData);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, structuredData]);

  return null;
};
