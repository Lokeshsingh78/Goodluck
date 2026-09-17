import express from 'express';
import db from '../database.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

// 1. Get user wishlist
router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data: rows, error } = await supabase
        .from('wishlist')
        .select('id, product_id, products(*)')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const wishlist = (rows || []).map((w) => {
        const r = w.products || {};
        return {
          wishlist_id: w.id,
          id: r.id || w.product_id,
          name: r.name,
          price: r.price ? parseFloat(r.price) : 0,
          discountPrice: parseFloat(r.discount_price || 0),
          imageFront: r.image_front,
          imageBack: r.image_back,
          sizes: typeof r.sizes === 'string' ? JSON.parse(r.sizes) : (Array.isArray(r.sizes) ? r.sizes : []),
          inStock: Boolean(r.in_stock)
        };
      });

      return res.json({ wishlist });
    } else {
      const rows = db.prepare(`
        SELECT w.id as wishlist_id, p.*
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
      `).all(req.user.id);

      const wishlist = rows.map((r) => ({
        ...r,
        sizes: r.sizes ? JSON.parse(r.sizes) : [],
        details: r.details ? JSON.parse(r.details) : [],
        inStock: Boolean(r.in_stock)
      }));

      return res.json({ wishlist });
    }
  } catch (err) {
    console.error('Wishlist fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist.' });
  }
});

// 2. Toggle wishlist item
router.post('/toggle', async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    if (isSupabaseConfigured) {
      const { data: existing } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        await supabase.from('wishlist').delete().eq('id', existing.id);
        return res.json({ inWishlist: false, message: 'Removed from wishlist.' });
      } else {
        await supabase.from('wishlist').insert([{ user_id: req.user.id, product_id: productId }]);
        return res.json({ inWishlist: true, message: 'Added to wishlist!' });
      }
    } else {
      const existing = db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?').get(req.user.id, productId);

      if (existing) {
        db.prepare('DELETE FROM wishlist WHERE id = ?').run(existing.id);
        res.json({ inWishlist: false, message: 'Removed from wishlist.' });
      } else {
        db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)').run(req.user.id, productId);
        res.json({ inWishlist: true, message: 'Added to wishlist!' });
      }
    }
  } catch (err) {
    console.error('Wishlist toggle error:', err);
    res.status(500).json({ error: 'Failed to toggle wishlist item.' });
  }
});

// 3. Remove wishlist item
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    if (isSupabaseConfigured) {
      await supabase.from('wishlist').delete().eq('user_id', req.user.id).eq('product_id', productId);
    } else {
      db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(req.user.id, productId);
    }
    res.json({ message: 'Item removed from wishlist.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from wishlist.' });
  }
});

export default router;
