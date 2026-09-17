import express from 'express';
import db from '../database.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

// 1. Get user saved addresses
router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data: addresses, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', req.user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ addresses: addresses || [] });
    } else {
      const addresses = db.prepare(`
        SELECT * FROM user_addresses
        WHERE user_id = ?
        ORDER BY is_default DESC, created_at DESC
      `).all(req.user.id);
      return res.json({ addresses });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses.' });
  }
});

// 2. Add saved address
router.post('/', async (req, res) => {
  try {
    const { customerName, phone, addressLine, city, state, pincode, isDefault } = req.body;
    if (!customerName || !phone || !addressLine) {
      return res.status(400).json({ error: 'Name, phone, and address details are required.' });
    }

    if (isSupabaseConfigured) {
      if (isDefault) {
        await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', req.user.id);
      }
      const { data, error } = await supabase.from('user_addresses').insert([{
        user_id: req.user.id,
        customer_name: customerName,
        phone,
        address_line: addressLine,
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        is_default: Boolean(isDefault)
      }]).select('id').single();

      if (error) throw error;
      return res.status(201).json({ message: 'Address saved successfully.', id: data.id });
    } else {
      if (isDefault) {
        db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
      }

      const result = db.prepare(`
        INSERT INTO user_addresses (user_id, customer_name, phone, address_line, city, state, pincode, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, customerName, phone, addressLine, city || '', state || '', pincode || '', isDefault ? 1 : 0);

      return res.status(201).json({ message: 'Address saved successfully.', id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to save address.' });
  }
});

// 3. Delete saved address
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured) {
      await supabase.from('user_addresses').delete().eq('id', id).eq('user_id', req.user.id);
    } else {
      db.prepare('DELETE FROM user_addresses WHERE id = ? AND user_id = ?').run(id, req.user.id);
    }
    res.json({ message: 'Address deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address.' });
  }
});

export default router;
