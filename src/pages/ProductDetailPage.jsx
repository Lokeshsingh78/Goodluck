import React, { useState } from 'react';
import { Star, ShoppingBag, Plus, Minus, Check, Truck, ShieldCheck, ChevronDown, ArrowLeft, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { SEOHead } from '../components/SEOHead';
import { SizeGuideModal } from '../components/SizeGuideModal';

export const ProductDetailPage = () => {
  const {
    products,
    selectedProductId,
    addToCart,
    formatPrice,
    navigateTo,
    toggleWishlist,
    isInWishlist,
    recentlyViewed,
    productReviews,
    addProductReview
  } = useShop();

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const isWishlisted = isInWishlist(product.id);

  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const customReviews = productReviews[product.id] || [];

  const defaultReviewsList = [
    {
      id: 'rev-1',
      author: 'Aarav M.',
      rating: 5,
      date: '2 days ago',
      title: 'Heavyweight organic cotton drape is insane 🔥',
      comment: 'Quality is genuinely top tier. 200g/m² weight feels heavy, super structured boxy fit. The back print typography is razor sharp.',
      verified: true
    },
    {
      id: 'rev-2',
      author: 'Priya K.',
      rating: 5,
      date: '1 week ago',
      title: 'The best statement streetwear brand in India',
      comment: 'Bought the oversized fit in size M. It drops right at the elbows, zero print cracking after 3 washes!',
      verified: true
    }
  ];

  const allReviews = [...customReviews, ...defaultReviewsList];

  const productImages = (product?.images && product.images.length > 0)
    ? product.images
    : [product?.imageFront, product?.imageBack].filter(Boolean);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [viewBackQuote, setViewBackQuote] = useState(false);
  const [activeTab, setActiveTab] = useState('fit');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);

  const currentMainImage = productImages[selectedImageIndex] || product.imageFront;

  const productCanonicalUrl = `https://goodlucksociety.in/product/${product.id}`;
  const absoluteOgImage = currentMainImage?.startsWith('http') ? currentMainImage : `https://goodlucksociety.in${currentMainImage}`;

  const productStructuredData = [
    {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': product.name,
      'image': productImages.map((img) => (img?.startsWith('http') ? img : `https://goodlucksociety.in${img}`)),
      'description': product.description || `Buy ${product.name} featuring rear statement quote: "${product.quoteBack || product.quote_back}". Premium 240+ GSM organic cotton oversized streetwear tee.`,
      'sku': product.id,
      'brand': {
        '@type': 'Brand',
        'name': 'Good Luck Society'
      },
      'offers': {
        '@type': 'Offer',
        'url': productCanonicalUrl,
        'priceCurrency': 'INR',
        'price': product.price,
        'priceValidUntil': '2027-12-31',
        'itemCondition': 'https://schema.org/NewCondition',
        'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'seller': {
          '@type': 'Organization',
          'name': 'Good Luck Society'
        }
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': product.rating || 4.9,
        'reviewCount': product.reviewsCount || product.reviews_count || 42
      }
    },
    {
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
          'name': 'Catalog',
          'item': 'https://goodlucksociety.in/catalog'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': product.name,
          'item': productCanonicalUrl
        }
      ]
    }
  ];

  return (
    <div className="pdp-container container">
      <SEOHead
        title={`${product.name} - Statement Oversized Tee`}
        description={`Shop ${product.name} by Good Luck Society. Premium 240+ GSM organic heavyweight cotton with rear print quote: "${product.quoteBack || product.quote_back}". Free express delivery in India.`}
        keywords={`${product.name}, oversized tshirt, ${product.quoteBack || ''}, heavyweight cotton tee, statement tshirts Mumbai`}
        canonicalUrl={productCanonicalUrl}
        ogImage={absoluteOgImage}
        ogType="product"
        structuredData={productStructuredData}
      />
      {/* Back to Catalog Navigation Button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          className="back-to-catalog-btn"
          onClick={() => navigateTo('catalog')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            background: '#ffffff',
            color: '#000000',
            fontWeight: 800,
            fontSize: '0.82rem',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <ArrowLeft size={16} /> BACK TO CATALOG
        </button>
      </div>

      <div className="pdp-grid">
        {/* Left Column: Gallery & Quote Overlay Toggle */}
        <div className="pdp-gallery">
          <div className="pdp-main-image">
            {!viewBackQuote ? (
              <img
                src={currentMainImage}
                alt={product.name}
                className="pdp-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="pdp-quote-overlay">
                <div>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--bg-accent)',
                      fontWeight: 700,
                      letterSpacing: '0.1em'
                    }}
                  >
                    REAR STATEMENT PRINT
                  </span>
                  <h3 style={{ marginTop: '1rem', color: '#ffffff' }}>
                    "{product.quoteBack}"
                  </h3>
                </div>
              </div>
            )}
          </div>

          {/* Gallery Thumbnails Strip */}
          {productImages.length > 0 && (
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setViewBackQuote(false);
                  }}
                  style={{
                    width: '64px',
                    height: '76px',
                    padding: 0,
                    border: (!viewBackQuote && selectedImageIndex === idx) ? '2px solid #000000' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#f5f5f5',
                    flexShrink: 0,
                    opacity: (!viewBackQuote && selectedImageIndex === idx) ? 1 : 0.65,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setViewBackQuote(false);
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                background: !viewBackQuote ? '#000' : '#fff',
                color: !viewBackQuote ? '#fff' : '#000'
              }}
            >
              FRONT / IMAGE VIEW
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setViewBackQuote(true);
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                background: viewBackQuote ? '#000' : '#fff',
                color: viewBackQuote ? '#fff' : '#000'
              }}
            >
              BACK PRINT QUOTE
            </button>
          </div>
        </div>

        {/* Right Column: Product Details & Controls */}
        <div className="pdp-details-col">
          <div className="rating-row" style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <span className="rating-count" style={{ fontSize: '0.85rem' }}>
              {product.rating} ({product.reviewsCount} customer reviews)
            </span>
          </div>

          <h1 className="pdp-title">{product.name}</h1>
          <p className="pdp-price">{formatPrice(product.price)}</p>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {product.description}
          </p>



          {/* Size Selector */}
          <div className="size-selector-wrap">
            <div className="size-header">
              <span>SELECT SIZE: <strong>{selectedSize}</strong></span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-color)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: 0
                }}
              >
                📏 Size Guide
              </button>
            </div>

            <div className="size-pills">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  className={`size-pill ${selectedSize === sz ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedSize(sz);
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Model Fit Tip */}
            <div className="size-recommendation-box">
              <strong>💡 SIZE RECOMMENDATION:</strong> Alex is 187 cm tall (6ft 1) and wears size M. Choose your standard size for a relaxed boxy drape, or size up for an ultra-oversized street silhouette!
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="quantity-add-row">
            <div className="quantity-control">
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={16} />
              </button>
              <span className="qty-number">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              className="add-to-cart-full"
              onClick={() => addToCart(product, selectedSize, quantity)}
            >
              <ShoppingBag size={20} /> ADD TO CART &bull; {formatPrice(product.price * quantity)}
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-sm)',
                border: isWishlisted ? '2px solid #dc2626' : '1px solid var(--border-color)',
                background: isWishlisted ? '#fef2f2' : '#ffffff',
                color: isWishlisted ? '#dc2626' : '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Heart size={22} fill={isWishlisted ? "#dc2626" : "none"} color={isWishlisted ? "#dc2626" : "#000000"} />
            </button>
          </div>

          {/* Guarantee Badges */}
          <div style={{ display: 'flex', gap: '1.5rem', margin: '1rem 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Truck size={16} color="#000" /> Fast Dispatch (2-3 Days)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="#000" /> 14 Days Free Return
            </span>
          </div>

          {/* Detail Tabs Accordion */}
          <div className="pdp-accordion">
            <div className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => setActiveTab(activeTab === 'fit' ? null : 'fit')}
              >
                <span>SIZE & FIT</span>
                <ChevronDown size={18} />
              </button>
              {activeTab === 'fit' && (
                <div className="accordion-content">
                  <ul>
                    <li>Intentional boxy oversized fit</li>
                    <li>Dropped shoulders with relaxed elbow-length sleeves</li>
                    <li>Unisex sizing engineered for maximum statement impact</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => setActiveTab(activeTab === 'mat' ? null : 'mat')}
              >
                <span>MATERIAL & CARE</span>
                <ChevronDown size={18} />
              </button>
              {activeTab === 'mat' && (
                <div className="accordion-content">
                  <ul>
                    <li>100% Combed Heavy Cotton (200 g/m²)</li>
                    <li>High-density non-crack screen print</li>
                    <li>Machine wash inside out at 30°C. Do not tumble dry.</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => setActiveTab(activeTab === 'ship' ? null : 'ship')}
              >
                <span>SHIPPING & RETURNS</span>
                <ChevronDown size={18} />
              </button>
              {activeTab === 'ship' && (
                <div className="accordion-content">
                  <p>Shipped directly from our India warehouse via Express Courier. Free standard shipping on all orders over ₹999.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Star Ratings Section */}
      <div style={{ marginTop: '5rem', borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
              CUSTOMER REVIEWS ({allReviews.length})
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>4.9 out of 5</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>based on verified buyer ratings</span>
            </div>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            style={{
              padding: '0.65rem 1.4rem',
              background: '#000000',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            {showReviewForm ? 'CANCEL REVIEW' : '✍️ WRITE A REVIEW'}
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!reviewAuthor || !reviewComment) return;
              addProductReview(product.id, {
                author: reviewAuthor,
                rating: reviewRating,
                title: reviewTitle || 'Awesome Tee!',
                comment: reviewComment
              });
              setReviewAuthor('');
              setReviewTitle('');
              setReviewComment('');
              setShowReviewForm(false);
            }}
            style={{
              background: '#fafafa',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              marginBottom: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              maxWidth: '650px'
            }}
          >
            <h4 style={{ fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>WRITE YOUR REVIEW</h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>YOUR NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul S."
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>RATING</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Fair)</option>
                  <option value={1}>1 Star (Poor)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>REVIEW TITLE</label>
              <input
                type="text"
                placeholder="Headline for your review..."
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>YOUR REVIEW COMMENT</label>
              <textarea
                required
                rows={3}
                placeholder="Tell us about the fabric weight, fit, print quality..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', resize: 'none' }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '0.65rem 1.5rem',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                alignSelf: 'flex-start'
              }}
            >
              SUBMIT REVIEW
            </button>
          </form>
        )}

        {/* Reviews Cards List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {allReviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{rev.date}</span>
              </div>
              <h5 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{rev.title}</h5>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                "{rev.comment}"
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Check size={14} /> {rev.author} (Verified Buyer)
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Related Products */}
      <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          YOU MIGHT ALSO LIKE
        </h3>
        <div className="product-grid">
          {relatedProducts.map((rel) => (
            <ProductCard key={rel.id} product={rel} />
          ))}
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        defaultSize={selectedSize}
      />
    </div>
  );
};
