import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'goodluck_society_super_secret_jwt_key_2026';

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, phone, address } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please provide email, password, and name.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    if (isSupabaseConfigured) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', cleanEmail).single();
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          email: cleanEmail,
          password: hashedPassword,
          name: name.trim(),
          role: 'user',
          phone: phone || '',
          address: address || '',
          is_active: true
        }])
        .select('id, email, name, role, phone, address')
        .single();

      if (error) throw error;

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ message: 'Registration successful!', token, user });
    } else {
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare(`
        INSERT INTO users (email, password, name, role, phone, address, is_active)
        VALUES (?, ?, ?, 'user', ?, ?, 1)
      `).run(cleanEmail, hashedPassword, name.trim(), phone || '', address || '');

      const user = db.prepare('SELECT id, email, name, role, phone, address FROM users WHERE id = ?').get(result.lastInsertRowid);
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({ message: 'Registration successful!', token, user });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create user account.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    let user = null;
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('users').select('*').eq('email', cleanEmail).single();
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

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address
    };

    res.json({ message: 'Login successful!', token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An unexpected error occurred during login.' });
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
        .single();
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
