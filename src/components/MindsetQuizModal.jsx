import React, { useState } from 'react';
import { X, Sparkles, Flame, ArrowRight, Zap, Target } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const VIBES = [
  { label: 'Unapologetic Attitude', icon: Flame, matchId: 'my-man-oversized-t-shirt', quote: 'MY MAN IS HOTTER THAN YOU.' },
  { label: 'Do Not Disturb', icon: Target, matchId: 'dont-talk-oversized-t-shirt', quote: "DON'T TALK TO ME." },
  { label: 'Taken & Savage', icon: Zap, matchId: 'crazy-boyfriend-oversized-t-shirt', quote: 'I HAVE A CRAZY BOYFRIEND.' },
  { label: 'Zero Interest', icon: Sparkles, matchId: 'not-interested-oversized-t-shirt', quote: "I'M NOT INTERESTED." }
];

export const MindsetQuizModal = ({ isOpen, onClose }) => {
  const { navigateToProduct } = useShop();
  const [selectedVibe, setSelectedVibe] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="search-modal" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          background: '#ffffff',
          border: '2px solid #000000',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '540px',
          width: '90%',
          padding: '2.5rem 2rem',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          className="icon-btn"
        >
          <X size={24} />
        </button>

        <span className="hero-tag" style={{ marginBottom: '0.75rem' }}>
          ✨ STATEMENT FINDER
        </span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          WHAT'S YOUR MOOD TODAY?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          Pick your vibe and let Good Luck Society match your signature statement tee.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          {VIBES.map((v) => {
            const Icon = v.icon;
            const isSelected = selectedVibe?.matchId === v.matchId;
            return (
              <button
                key={v.matchId}
                onClick={() => setSelectedVibe(v)}
                style={{
                  padding: '1.25rem 1rem',
                  border: isSelected ? '2px solid #000000' : '1px solid var(--border-color)',
                  background: isSelected ? '#000000' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#000000',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  transition: 'var(--transition)'
                }}
              >
                <Icon size={22} color={isSelected ? '#edffa7' : '#000000'} />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        {selectedVibe && (
          <div
            style={{
              background: 'var(--bg-accent)',
              color: '#000000',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              YOUR MATCHED STATEMENT:
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.25rem' }}>
              "{selectedVibe.quote}"
            </p>
          </div>
        )}

        <button
          className="btn-primary btn-dark"
          style={{ width: '100%' }}
          disabled={!selectedVibe}
          onClick={() => {
            if (selectedVibe) {
              navigateToProduct(selectedVibe.matchId);
              onClose();
            }
          }}
        >
          VIEW MATCHED T-SHIRT <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
