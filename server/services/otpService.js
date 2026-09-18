import crypto from 'crypto';
import db from '../database.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';

/**
 * Generates a cryptographically secure 6-digit OTP string.
 */
export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hashes an OTP string securely using SHA-256.
 */
export function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
}

/**
 * Checks if a resend request is allowed under the 60-second cooldown rule.
 * @param {string} email
 * @returns {Promise<{ allowed: boolean, waitSeconds?: number }>}
 */
export async function checkResendCooldown(email) {
  const cleanEmail = email.toLowerCase().trim();
  const COOLDOWN_MS = 60 * 1000; // 60 seconds

  try {
    let lastRecord = null;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('otp_verifications')
          .select('created_at')
          .eq('email', cleanEmail)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        lastRecord = data;
      } catch (sbErr) {
        // Fallback to SQLite if table missing on Supabase
        lastRecord = db.prepare(`
          SELECT created_at FROM otp_verifications
          WHERE email = ?
          ORDER BY id DESC LIMIT 1
        `).get(cleanEmail);
      }
    } else {
      lastRecord = db.prepare(`
        SELECT created_at FROM otp_verifications
        WHERE email = ?
        ORDER BY id DESC LIMIT 1
      `).get(cleanEmail);
    }

    if (!lastRecord || !lastRecord.created_at) {
      return { allowed: true };
    }

    const createdTime = new Date(lastRecord.created_at).getTime();
    const now = Date.now();
    const elapsed = now - createdTime;

    if (elapsed < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      return { allowed: false, waitSeconds };
    }

    return { allowed: true };
  } catch (err) {
    console.error('[OTP Service] Cooldown check error:', err);
    return { allowed: true };
  }
}

/**
 * Creates a new 6-digit OTP, invalidates previous active OTPs for the email, and saves to DB.
 * @param {number|string|null} userId
 * @param {string} email
 * @returns {Promise<{ otp: string, expiresAt: Date }>}
 */
export async function createAndSaveOtp(userId, email) {
  const cleanEmail = email.toLowerCase().trim();
  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  const EXPIRY_MINUTES = 10;
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);
  const expiresAtIso = expiresAt.toISOString();

  let savedToSupabase = false;

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('otp_verifications')
        .update({ used: true })
        .eq('email', cleanEmail)
        .eq('used', false);

      const { error } = await supabase
        .from('otp_verifications')
        .insert([{
          user_id: userId || null,
          email: cleanEmail,
          otp_hash: otpHash,
          attempts: 0,
          used: false,
          expires_at: expiresAtIso
        }]);

      if (!error) {
        savedToSupabase = true;
      }
    } catch (sbErr) {
      // Fallback to SQLite below
    }
  }

  if (!savedToSupabase) {
    // Invalidate existing active OTPs in SQLite
    db.prepare(`
      UPDATE otp_verifications
      SET used = 1
      WHERE email = ? AND used = 0
    `).run(cleanEmail);

    // Verify if userId exists in local SQLite users table before passing as FK
    let validLocalUserId = null;
    if (userId) {
      try {
        const localUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
        if (localUser) validLocalUserId = localUser.id;
      } catch (e) {}
    }

    // Insert new OTP record in SQLite
    db.prepare(`
      INSERT INTO otp_verifications (user_id, email, otp_hash, attempts, used, expires_at)
      VALUES (?, ?, ?, 0, 0, ?)
    `).run(validLocalUserId, cleanEmail, otpHash, expiresAtIso);
  }

  return { otp, expiresAt };
}

/**
 * Validates an input OTP against stored hash, checking expiration & attempt limits.
 * @param {string} email
 * @param {string} inputOtp
 * @returns {Promise<{ valid: boolean, reason?: string, attemptsRemaining?: number }>}
 */
export async function validateAndConsumeOtp(email, inputOtp) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(inputOtp).trim();
  const inputHash = hashOtp(cleanOtp);

  try {
    let record = null;
    let isFromSupabase = false;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('otp_verifications')
          .select('*')
          .eq('email', cleanEmail)
          .eq('used', false)
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          record = data;
          isFromSupabase = true;
        }
      } catch (e) {}
    }

    if (!record) {
      record = db.prepare(`
        SELECT * FROM otp_verifications
        WHERE email = ? AND used = 0
        ORDER BY id DESC LIMIT 1
      `).get(cleanEmail);
    }

    if (!record) {
      return { valid: false, reason: 'EXPIRED' };
    }

    // Check expiration
    const expiryTime = new Date(record.expires_at).getTime();
    if (Date.now() > expiryTime) {
      await markOtpUsed(record.id, isFromSupabase);
      return { valid: false, reason: 'EXPIRED' };
    }

    // Check attempt limit
    const currentAttempts = Number(record.attempts) || 0;
    if (currentAttempts >= 5) {
      await markOtpUsed(record.id, isFromSupabase);
      return { valid: false, reason: 'TOO_MANY_ATTEMPTS' };
    }

    // Compare hash
    if (record.otp_hash === inputHash) {
      await markOtpUsed(record.id, isFromSupabase);
      return { valid: true };
    } else {
      const newAttempts = currentAttempts + 1;
      await incrementAttempts(record.id, newAttempts, isFromSupabase);

      if (newAttempts >= 5) {
        await markOtpUsed(record.id, isFromSupabase);
        return { valid: false, reason: 'TOO_MANY_ATTEMPTS', attemptsRemaining: 0 };
      }

      return {
        valid: false,
        reason: 'INVALID',
        attemptsRemaining: 5 - newAttempts
      };
    }
  } catch (err) {
    console.error('[OTP Service] Validation error:', err);
    throw err;
  }
}

async function markOtpUsed(recordId, isFromSupabase = false) {
  try {
    if (isFromSupabase && isSupabaseConfigured) {
      await supabase.from('otp_verifications').update({ used: true }).eq('id', recordId);
    }
    db.prepare('UPDATE otp_verifications SET used = 1 WHERE id = ?').run(recordId);
  } catch (e) {}
}

async function incrementAttempts(recordId, newAttempts, isFromSupabase = false) {
  try {
    if (isFromSupabase && isSupabaseConfigured) {
      await supabase.from('otp_verifications').update({ attempts: newAttempts }).eq('id', recordId);
    }
    db.prepare('UPDATE otp_verifications SET attempts = ? WHERE id = ?').run(newAttempts, recordId);
  } catch (e) {}
}
