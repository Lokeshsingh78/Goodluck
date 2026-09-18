import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { verifyToken } from '../middleware/auth.js';
import { sendLoginOtpEmail } from '../services/emailService.js';
import { createAndSaveOtp, validateAndConsumeOtp, checkResendCooldown } from '../services/otpService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'goodluck_society_super_secret_jwt_key_2026';

/**
 * Utility to mask email for privacy (e.g. j***e@example.com)
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

// Step 1: Register Credentials Validation & OTP Dispatch
router.post('/register', async (req, res) => {
  const { email, password, name, phone, address } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please provide email, password, and name.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // Check if account already exists
    if (isSupabaseConfigured) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', cleanEmail).maybeSingle();
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }
    } else {
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }
    }

    // Generate 6-digit OTP and save hash
    const { otp } = await createAndSaveOtp(null, cleanEmail);

    // Send OTP via ZeptoMail
    try {
      await sendLoginOtpEmail(cleanEmail, otp);
    } catch (emailErr) {
      console.error('[Auth] Failed to dispatch registration OTP email via ZeptoMail:', emailErr?.message || emailErr);
      return res.status(500).json({ error: 'Failed to send verification code email. Please try again later.' });
    }

    return res.status(200).json({
      otpRequired: true,
      email: cleanEmail,
      maskedEmail: maskEmail(cleanEmail),
      message: 'A 6-digit verification code has been sent to your email to complete registration.'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to initiate account registration.' });
  }
});

// Step 1: Login Credentials Validation & OTP Dispatch
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    let user = null;
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('users').select('*').eq('email', cleanEmail).maybeSingle();
      user = data;
    } else {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.is_active === false || user.is_active === 0) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
    }

    // Generate 6-digit OTP and save hash
    const { otp } = await createAndSaveOtp(user.id, cleanEmail);

    // Send OTP via ZeptoMail
    try {
      await sendLoginOtpEmail(cleanEmail, otp);
    } catch (emailErr) {
      console.error('[Auth] Failed to dispatch OTP email via ZeptoMail:', emailErr?.message || emailErr);
      return res.status(500).json({ error: 'Failed to send verification code email. Please try again later.' });
    }

    return res.json({
      otpRequired: true,
      email: cleanEmail,
      maskedEmail: maskEmail(cleanEmail),
      message: 'A 6-digit verification code has been sent to your email.'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An unexpected error occurred during login.' });
  }
});

// Step 2: Verify OTP & Issue Auth Token (Supports both Login & Registration)
router.post('/verify-otp', async (req, res) => {
  const { email, otp, registrationData } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.status(400).json({ error: 'Please enter a valid 6-digit numeric verification code.' });
  }

  try {
    // Validate OTP against DB
    const validationResult = await validateAndConsumeOtp(cleanEmail, cleanOtp);

    if (!validationResult.valid) {
      if (validationResult.reason === 'EXPIRED') {
        return res.status(400).json({ error: 'This verification code has expired. Please request a new code.' });
      }
      if (validationResult.reason === 'TOO_MANY_ATTEMPTS') {
        return res.status(400).json({ error: 'Too many incorrect attempts. Please request a new code.' });
      }
      return res.status(400).json({
        error: 'Invalid verification code. Please try again.'
      });
    }

    // Retrieve existing user or create new user if registrationData provided
    let user = null;
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('users').select('*').eq('email', cleanEmail).maybeSingle();
      user = data;
    } else {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
    }

    if (!user) {
      if (registrationData && registrationData.name && registrationData.password) {
        // Create account on successful OTP verification
        const hashedPassword = bcrypt.hashSync(registrationData.password, 10);
        if (isSupabaseConfigured) {
          const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
              email: cleanEmail,
              password: hashedPassword,
              name: registrationData.name.trim(),
              role: 'user',
              phone: registrationData.phone || '',
              address: registrationData.address || '',
              is_active: true
            }])
            .select('*')
            .single();
          if (error) throw error;
          user = newUser;
        } else {
          const result = db.prepare(`
            INSERT INTO users (email, password, name, role, phone, address, is_active)
            VALUES (?, ?, ?, 'user', ?, ?, 1)
          `).run(cleanEmail, hashedPassword, registrationData.name.trim(), registrationData.phone || '', registrationData.address || '');

          user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        }
      } else {
        return res.status(404).json({ error: 'User account not found.' });
      }
    }

    if (user.is_active === false || user.is_active === 0) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address
    };

    return res.json({
      message: 'Email verified successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[Auth] Verify OTP error:', err);
    res.status(500).json({ error: 'An unexpected error occurred during verification.' });
  }
});

// Step 3: Resend OTP with Cooldown Rate Limiting
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required to resend verification code.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // Check 60s cooldown
    const cooldown = await checkResendCooldown(cleanEmail);
    if (!cooldown.allowed) {
      return res.status(429).json({
        error: `Please wait ${cooldown.waitSeconds} seconds before requesting another code.`
      });
    }

    // Generate new OTP & invalidate previous ones
    const { otp } = await createAndSaveOtp(null, cleanEmail);

    // Send email via ZeptoMail
    try {
      await sendLoginOtpEmail(cleanEmail, otp);
    } catch (emailErr) {
      console.error('[Auth] Failed to resend OTP email:', emailErr?.message || emailErr);
      return res.status(500).json({ error: 'Failed to send new verification code. Please try again.' });
    }

    return res.json({
      message: 'A new verification code has been sent to your email.'
    });
  } catch (err) {
    console.error('[Auth] Resend OTP error:', err);
    res.status(500).json({ error: 'An unexpected error occurred while resending code.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// Get Current User Profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    let user = null;
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('users')
        .select('id, email, name, role, phone, address, created_at')
        .eq('id', req.user.id)
        .maybeSingle();
      user = data;
    } else {
      user = db.prepare('SELECT id, email, name, role, phone, address, created_at FROM users WHERE id = ?').get(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Update Profile
router.put('/profile', verifyToken, async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    let updatedUser = null;
    if (isSupabaseConfigured) {
      const updates = {};
      if (name) updates.name = name;
      if (phone !== undefined) updates.phone = phone;
      if (address !== undefined) updates.address = address;

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', req.user.id)
        .select('id, email, name, role, phone, address')
        .single();

      if (error) throw error;
      updatedUser = data;
    } else {
      db.prepare(`
        UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address)
        WHERE id = ?
      `).run(name, phone, address, req.user.id);

      updatedUser = db.prepare('SELECT id, email, name, role, phone, address FROM users WHERE id = ?').get(req.user.id);
    }

    res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});

export default router;
