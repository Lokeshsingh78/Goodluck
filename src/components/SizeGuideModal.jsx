import React, { useState } from 'react';
import { X, Ruler, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export const SizeGuideModal = ({ isOpen, onClose, defaultSize = 'M' }) => {
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'
  const [activeTab, setActiveTab] = useState('chart'); // 'chart', 'calculator'
  const [diagramType, setDiagramType] = useState('body'); // 'body' or 'garment'

  // Calculator state
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(72);
  const [calcResult, setCalcResult] = useState(null);

  if (!isOpen) return null;

  const measurementsIn = [
    { size: 'S', chest: '42.5"', length: '28.0"', shoulder: '21.0"', sleeve: '8.5"', recommended: '160–170 cm (55–65 kg)' },
    { size: 'M', chest: '45.0"', length: '29.0"', shoulder: '22.0"', sleeve: '9.0"', recommended: '170–180 cm (65–76 kg)' },
    { size: 'L', chest: '47.5"', length: '30.0"', shoulder: '23.0"', sleeve: '9.5"', recommended: '175–185 cm (76–87 kg)' },
    { size: 'XL', chest: '50.0"', length: '31.0"', shoulder: '24.0"', sleeve: '10.0"', recommended: '180–192 cm (87–98 kg)' },
    { size: 'XXL', chest: '53.0"', length: '32.0"', shoulder: '25.0"', sleeve: '10.5"', recommended: '185–198 cm (98–110 kg)' },
  ];

  const measurementsCm = [
    { size: 'S', chest: '108 cm', length: '71 cm', shoulder: '53 cm', sleeve: '22 cm', recommended: '160–170 cm (55–65 kg)' },
    { size: 'M', chest: '114 cm', length: '74 cm', shoulder: '56 cm', sleeve: '23 cm', recommended: '170–180 cm (65–76 kg)' },
    { size: 'L', chest: '120 cm', length: '76 cm', shoulder: '58 cm', sleeve: '24 cm', recommended: '175–185 cm (76–87 kg)' },
    { size: 'XL', chest: '127 cm', length: '79 cm', shoulder: '61 cm', sleeve: '25 cm', recommended: '180–192 cm (87–98 kg)' },
    { size: 'XXL', chest: '135 cm', length: '81 cm', shoulder: '63 cm', sleeve: '27 cm', recommended: '185–198 cm (98–110 kg)' },
  ];

  const currentData = unit === 'in' ? measurementsIn : measurementsCm;

  const calculateSize = () => {
    const w = Number(weightKg);
    let recSize = 'M';
    let fitNote = 'Signature Boxy Drop-Shoulder Fit';

    if (w < 62) {
      recSize = 'S';
      fitNote = 'Clean Boxy Drop-Shoulder Fit';
    } else if (w <= 75) {
      recSize = 'M';
      fitNote = 'Perfect Signature Oversized Drape';
    } else if (w <= 86) {
      recSize = 'L';
      fitNote = 'Relaxed Streetwear Fit';
    } else if (w <= 97) {
      recSize = 'XL';
      fitNote = 'Heavy Streetwear Boxy Fit';
    } else {
      recSize = 'XXL';
      fitNote = 'Ultra-Relaxed Oversized Silhouette';
    }

    setCalcResult({ size: recSize, fitNote });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(9, 9, 11, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          color: '#09090b',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '88vh',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: '1px solid #e4e4e7'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.1rem 1.5rem',
            borderBottom: '1px solid #e4e4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Ruler size={20} style={{ color: '#09090b' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase', margin: 0 }}>
                SIZE GUIDE
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#71717a', margin: 0, fontWeight: 500 }}>
                200 GSM Heavyweight Organic Cotton • Oversized Boxy Cut
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f4f4f5',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#09090b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            padding: '0.65rem 1.5rem',
            background: '#ffffff',
            borderBottom: '1px solid #f4f4f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('chart')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: activeTab === 'chart' ? '2px solid #09090b' : '1px solid #e4e4e7',
                background: activeTab === 'chart' ? '#09090b' : '#ffffff',
                color: activeTab === 'chart' ? '#ffffff' : '#52525b',
                cursor: 'pointer'
              }}
            >
              SIZE CHART & DIAGRAM
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: activeTab === 'calculator' ? '2px solid #09090b' : '1px solid #e4e4e7',
                background: activeTab === 'calculator' ? '#09090b' : '#ffffff',
                color: activeTab === 'calculator' ? '#ffffff' : '#52525b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Sparkles size={14} color={activeTab === 'calculator' ? '#eab308' : '#71717a'} /> FIND MY SIZE
            </button>
          </div>

          {activeTab === 'chart' && (
            <div style={{ display: 'flex', alignItems: 'center', background: '#f4f4f5', padding: '2px', borderRadius: '6px', border: '1px solid #e4e4e7' }}>
              <button
                onClick={() => setUnit('in')}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: 'none',
                  background: unit === 'in' ? '#09090b' : 'transparent',
                  color: unit === 'in' ? '#ffffff' : '#71717a',
                  cursor: 'pointer'
                }}
              >
                IN
              </button>
              <button
                onClick={() => setUnit('cm')}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: 'none',
                  background: unit === 'cm' ? '#09090b' : 'transparent',
                  color: unit === 'cm' ? '#ffffff' : '#71717a',
                  cursor: 'pointer'
                }}
              >
                CM
              </button>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'chart' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: '1.25rem', alignItems: 'start', marginBottom: '1rem' }}>
                {/* Body diagram image box with switcher */}
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  
                  {/* Diagram Switch Pills */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', background: '#e2e8f0', padding: '2px', borderRadius: '6px', marginBottom: '0.6rem' }}>
                    <button
                      onClick={() => setDiagramType('body')}
                      style={{
                        flex: 1,
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        border: 'none',
                        background: diagramType === 'body' ? '#09090b' : 'transparent',
                        color: diagramType === 'body' ? '#ffffff' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      BODY
                    </button>
                    <button
                      onClick={() => setDiagramType('garment')}
                      style={{
                        flex: 1,
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        border: 'none',
                        background: diagramType === 'garment' ? '#09090b' : 'transparent',
                        color: diagramType === 'garment' ? '#ffffff' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      FLAT-LAY
                    </button>
                  </div>

                  <img
                    src={diagramType === 'body' ? '/images/body_measurements.png' : '/images/flatlay_measurements.png'}
                    alt="Measurement Guide Diagram"
                    style={{ maxHeight: '160px', width: 'auto', objectFit: 'contain', margin: '0 auto', transition: 'all 0.2s ease' }}
                  />
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginTop: '0.4rem' }}>
                    {diagramType === 'body' ? 'BODY SILHOUETTE GUIDE' : 'FLAT-LAY TEE SPECIFICATION'}
                  </div>
                </div>

                {/* Table */}
                <div>
                  <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                      <thead>
                        <tr style={{ background: '#09090b', color: '#ffffff' }}>
                          <th style={{ padding: '0.65rem 0.85rem', fontWeight: 800 }}>SIZE</th>
                          <th style={{ padding: '0.65rem 0.85rem', fontWeight: 800 }}>CHEST</th>
                          <th style={{ padding: '0.65rem 0.85rem', fontWeight: 800 }}>LENGTH</th>
                          <th style={{ padding: '0.65rem 0.85rem', fontWeight: 800 }}>SHOULDER</th>
                          <th style={{ padding: '0.65rem 0.85rem', fontWeight: 800 }}>SLEEVE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentData.map((row, idx) => {
                          const isDefault = row.size === defaultSize;
                          return (
                            <tr
                              key={row.size}
                              style={{
                                background: isDefault ? '#f4f4f5' : idx % 2 === 0 ? '#ffffff' : '#fafafa',
                                borderBottom: '1px solid #e4e4e7',
                                fontWeight: isDefault ? 800 : 500
                              }}
                            >
                              <td style={{ padding: '0.65rem 0.85rem', fontWeight: 900, color: '#09090b' }}>
                                {row.size} {isDefault && <span style={{ fontSize: '0.65rem', background: '#09090b', color: '#fff', padding: '0.1rem 0.35rem', borderRadius: '3px', marginLeft: '0.2rem' }}>SELECTED</span>}
                              </td>
                              <td style={{ padding: '0.65rem 0.85rem' }}>{row.chest}</td>
                              <td style={{ padding: '0.65rem 0.85rem' }}>{row.length}</td>
                              <td style={{ padding: '0.65rem 0.85rem' }}>{row.shoulder}</td>
                              <td style={{ padding: '0.65rem 0.85rem' }}>{row.sleeve}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Clean bullet tips */}
                  <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: '#52525b' }}>
                    <div style={{ background: '#fafafa', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #f4f4f5' }}>
                      <strong>1. Chest:</strong> Measure fullest part under armpits.
                    </div>
                    <div style={{ background: '#fafafa', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #f4f4f5' }}>
                      <strong>2. Length:</strong> Shoulder seam down to hem.
                    </div>
                  </div>
                </div>
              </div>

              {/* Fit note */}
              <div style={{ padding: '0.6rem 0.85rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '0.76rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> True to Size (Boxy Oversized Fit) • Size down if you prefer a standard fitted style.
              </div>
            </div>
          )}

          {activeTab === 'calculator' && (
            <div style={{ maxWidth: '440px', margin: '0 auto', padding: '0.5rem 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.2rem 0' }}>
                  QUICK SIZE CALCULATOR
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#71717a', margin: 0 }}>
                  Adjust sliders for an instant size recommendation.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    <span>HEIGHT: {heightCm} CM</span>
                    <span>({Math.floor(heightCm / 30.48)}' {Math.round((heightCm % 30.48) / 2.54)}")</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="205"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    style={{ width: '100%', accentColor: '#09090b', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    <span>WEIGHT: {weightKg} KG</span>
                    <span>({Math.round(weightKg * 2.20462)} LBS)</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="115"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    style={{ width: '100%', accentColor: '#09090b', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <button
                onClick={calculateSize}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#09090b',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                CALCULATE SIZE <ArrowRight size={16} />
              </button>

              {calcResult && (
                <div
                  style={{
                    marginTop: '1.2rem',
                    background: '#09090b',
                    color: '#ffffff',
                    padding: '1.2rem',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#eab308', textTransform: 'uppercase' }}>
                    RECOMMENDED SIZE
                  </span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0.2rem 0' }}>
                    {calcResult.size}
                  </div>
                  <p style={{ fontSize: '0.8rem', margin: 0, opacity: 0.85 }}>
                    {calcResult.fitNote}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            background: '#fafafa',
            borderTop: '1px solid #e4e4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#71717a'
          }}
        >
          <span>Free size exchanges on all orders</span>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem 1rem',
              background: '#09090b',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
