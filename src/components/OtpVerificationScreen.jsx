import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { useShop } from '../context/ShopContext';

/**
 * Reusable 6-Digit OTP Verification Screen component.
 * @param {Object} props
 * @param {string} props.email - Clean email address
 * @param {string} props.maskedEmail - Masked email address for display
 * @param {Function} props.onSuccess - Callback after successful verification
 * @param {Function} props.onBack - Callback to return to credential entry
 */
export const OtpVerificationScreen = ({ email, maskedEmail, registrationData = null, onSuccess, onBack }) => {
  const { verifyOtp, resendOtp, showToast } = useShop();

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  // 60-Second Cooldown Timer
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Countdown timer interval
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs[0]?.current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleDigitChange = (index, value) => {
    // Only numeric characters allowed
    const cleanVal = value.replace(/\D/g, '');

    if (!cleanVal) {
      const newOtp = [...otpDigits];
      newOtp[index] = '';
      setOtpDigits(newOtp);
      return;
    }

    // Handle single digit input
    const digit = cleanVal.slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = digit;
    setOtpDigits(newOtp);

    // Auto-advance to next input
    if (index < 5 && inputRefs[index + 1]?.current) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  // Support pasting 6-digit OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split('');
    const newOtp = [...otpDigits];
    digits.forEach((d, i) => {
      if (i < 6) newOtp[i] = d;
    });
    setOtpDigits(newOtp);

    // Focus last box or appropriate box
    const focusIndex = Math.min(digits.length, 5);
    inputRefs[focusIndex]?.current?.focus();
  };

  const fullOtp = otpDigits.join('');
  const isOtpComplete = fullOtp.length === 6;

  const handleVerifySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isOtpComplete || verifying) return;

    setErrorMsg('');
    setSuccessMsg('');
    setVerifying(true);

    try {
      const res = await verifyOtp(email, fullOtp, registrationData);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(res.message || 'Email verified successfully.');
        showToast('Email verified successfully! Welcome.');
        if (onSuccess) {
          onSuccess(res.user);
        }
      }
    } catch (err) {
      setErrorMsg('Network error verifying code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendClick = async () => {
    if (cooldown > 0 || resending) return;

    setErrorMsg('');
    setSuccessMsg('');
    setResending(true);

    try {
      const res = await resendOtp(email);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(res.message || 'A new verification code has been sent to your email.');
        showToast('A new verification code has been sent.');
        setCooldown(60); // Reset 60s cooldown
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs[0]?.current?.focus();
      }
    } catch (err) {
      setErrorMsg('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Badge */}
      <div style={{ textAlignment: 'center', textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#f4f4f5',
            border: '1px solid #e4e4e7',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            color: '#09090b'
          }}
        >
          <Lock size={24} />
        </div>
        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
          VERIFY YOUR EMAIL
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
          Enter the 6-digit code sent to <br />
          <strong style={{ color: 'var(--text-primary)' }}>{maskedEmail || email}</strong>
        </p>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: 'var(--radius-sm)',
            color: '#991b1b',
            fontSize: '0.84rem',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-sm)',
            color: '#15803d',
            fontSize: '0.84rem',
            fontWeight: 600,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* 6-Digit OTP Boxes Form */}
      <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onPaste={handlePaste}>
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              style={{
                width: '46px',
                height: '52px',
                textAlign: 'center',
                fontSize: '1.3rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-sm)',
                border: digit ? '2px solid #000000' : '1px solid var(--border-color)',
                backgroundColor: digit ? '#fafafa' : '#ffffff',
                outline: 'none',
                fontFamily: 'monospace',
                boxShadow: digit ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            />
          ))}
        </div>

        {/* Verify Submit Button */}
        <button
          type="submit"
          disabled={!isOtpComplete || verifying}
          style={{
            padding: '0.85rem',
            backgroundColor: '#000000',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 800,
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            cursor: !isOtpComplete || verifying ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: !isOtpComplete || verifying ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {verifying ? (
            <>
              <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} /> VERIFYING...
            </>
          ) : (
            'VERIFY & SIGN IN'
          )}
        </button>
      </form>

      {/* Resend & Back Action Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Didn't receive the code?{' '}
          {cooldown > 0 ? (
            <span style={{ fontWeight: 700, color: '#000000' }}>
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendClick}
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: '#000000',
                fontWeight: 800,
                textDecoration: 'underline',
                cursor: resending ? 'not-allowed' : 'pointer',
                padding: 0
              }}
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-light)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};
