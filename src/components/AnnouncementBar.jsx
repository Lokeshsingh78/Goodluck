import React, { useState, useEffect } from 'react';

const ANNOUNCEMENTS = [
  '⚡ FREE SHIPPING ON ORDERS OVER ₹999',
  '🔥 CLOTHES WITH SOMETHING TO SAY',
  '📦 14 DAYS EASY RETURN POLICY',
  '🇮🇳 HIGH-DENSITY SCREEN PRINTED IN INDIA'
];

export const AnnouncementBar = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="announcement-bar">
      <div className="announcement-text" key={index}>
        <span>{ANNOUNCEMENTS[index]}</span>
      </div>
    </div>
  );
};
