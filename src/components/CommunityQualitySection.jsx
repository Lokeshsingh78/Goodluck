import React, { useState } from 'react';

const COMMUNITY_ITEMS = [
  { id: 1, image: '/images/better_tshirt.png' },
  { id: 2, image: '/images/better_tshirt.png' },
  { id: 3, image: '/images/better_tshirt.png' },
  { id: 4, image: '/images/better_tshirt.png' },
  { id: 5, image: '/images/better_tshirt.png' },
  { id: 6, image: '/images/better_tshirt.png' },
  { id: 7, image: '/images/better_tshirt.png' },
  { id: 8, image: '/images/better_tshirt.png' },
  { id: 9, image: '/images/better_tshirt.png' }
];

export const CommunityQualitySection = ({
  qualityImage = '/images/tshirt_quality_detail.png',
  fallbackQualityImage = '/images/better_tshirt.png'
}) => {
  const [imgError, setImgError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicating items for seamless continuous infinite marquee
  const displayItems = [...COMMUNITY_ITEMS, ...COMMUNITY_ITEMS];

  return (
    <section className="community-quality-wrapper">
      {/* 1. AUTO-MOVING COMMUNITY GALLERY (PAUSES WHEN MOUSE HOVERS OVER ANY IMAGE) */}
      <div className="community-section">
        <div className="community-header-wrap">
          <span className="community-sublabel">GOOD LUCK SOCIETY</span>
          <h2 className="community-title">Community:</h2>
        </div>

        <div className="community-slider-container">
          <div
            className="community-marquee-wrapper"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className={`community-marquee-track ${isPaused ? 'paused' : ''}`}
              style={{
                animationPlayState: isPaused ? 'paused' : 'running',
                WebkitAnimationPlayState: isPaused ? 'paused' : 'running'
              }}
            >
              {displayItems.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="community-card"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <img
                    src={item.image}
                    alt="Community T-shirt"
                    draggable={false}
                    className="community-card-img"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUALITY SHOWCASE SECTION */}
      <div className="quality-section-container">
        <div className="quality-content-grid">
          {/* Left Column Image */}
          <div className="quality-image-wrapper">
            <img
              src={imgError ? fallbackQualityImage : qualityImage}
              alt="Good Luck Society Quality T-shirt Detail"
              onError={() => setImgError(true)}
              className="quality-image"
            />
          </div>

          {/* Right Column Specifications */}
          <div className="quality-text-content">
            <span className="quality-subtag">GOOD LUCK SOCIETY</span>
            <h2 className="quality-heading">Quality</h2>
            <p className="quality-paragraph">
              We construct every T-shirt from 100% organic cotton at 200g/m² for a boxy oversized fit that retains its shape and drape.
            </p>
            <p className="quality-paragraph">
              Paired with high-density screen printing that remains sharp, vibrant, and crack-free through everyday wear and repeated washes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
