import React from 'react';

export const MarqueeTicker = ({ text, bg = '#000000', color = '#ffffff', outline = false, speed = 30, style = {} }) => {
  const items = Array(8).fill(text);

  return (
    <div
      style={{
        backgroundColor: bg,
        color: color,
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        padding: '0.85rem 0',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        userSelect: 'none',
        ...style
      }}
    >
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
        {items.map((item, idx) => (
          <span
            key={idx}
            className={outline ? 'marquee-text-outline' : 'marquee-text'}
          >
            {item} &bull; &nbsp;
          </span>
        ))}
      </div>
    </div>
  );
};
