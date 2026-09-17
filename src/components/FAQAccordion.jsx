import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQS } from '../data/products';

export const FAQAccordion = () => {
  const [openId, setOpenId] = useState(1);

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="section" style={{ backgroundColor: '#ffffff' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="section-title-wrap">
          <span className="section-label">FREQUENTLY ASKED QUESTIONS</span>
          <h2 className="section-title">GOT QUESTIONS? WE GOT ANSWERS.</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'var(--transition)',
                  backgroundColor: isOpen ? '#fafafa' : '#ffffff'
                }}
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#000000'
                  }}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={20}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.5rem 1.25rem 1.5rem',
                      fontSize: '0.92rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
