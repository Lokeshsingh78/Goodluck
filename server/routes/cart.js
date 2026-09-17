import express from 'express';
import db from '../database.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get cart items for logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data: rows, error } = await supabase
        .from('cart_items')
        .select('id, product_id, size, quantity, products(id, name, price, image_front, quote_back)')
        .eq('user_id', req.user.id);

      if (error) throw error;

      const items = (rows || []).map((c) => ({
        id: c.products?.id || c.product_id,
        productId: c.product_id,
        size: c.size,
        quantity: c.quantity,
        name: c.products?.name,
        price: c.products?.price ? parseFloat(c.products.price) : 0,
        image: c.products?.image_front,
        quoteBack: c.products?.quote_back
      }));

      return res.json({ cart: items });
    } else {
      const items = db.prepare(`
        SELECT c.id, c.product_id as productId, c.size, c.quantity,
               p.name, p.price, p.image_front as image, p.quote_back as quoteBack
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
      `).all(req.user.id);

      return res.json({ cart: items });
    }
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch cart.' });
  }
});

// Add item to cart
router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, size = 'M', quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    if (isSupabaseConfigured) {
      const { data: product } = await supabase.from('products').select('id, stock').eq('id', productId).single();
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      if (product.stock < quantity) {
        return res.status(400).json({ error: 'Insufficient stock available.' });
      }

      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', req.user.id)
        .eq('product_id', productId)
        .eq('size', size)
        .single();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert([{
          user_id: req.user.id,
          product_id: productId,
          size,
          quantity
        }]);
      }

      return res.json({ message: 'Added to cart successfully.' });
    } else {
      const product = db.prepare('SELECT id, name, price, stock FROM products WHERE id = ?').get(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      if (product.stock < quantity) {
        return res.status(400).json({ error: 'Insufficient stock available.' });
      }

      const existing = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?').get(req.user.id, productId, size);

      if (existing) {
        db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
      } else {
        db.prepare('INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)').run(req.user.id, productId, size, quantity);
      }

      return res.json({ message: 'Added to cart successfully.' });
    }
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add item to cart.' });
  }
});

// Update item quantity
router.put('/', verifyToken, async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;

    if (isSupabaseConfigured) {
      if (quantity <= 0) {
        await supabase.from('cart_items').delete().eq('user_id', req.user.id).eq('product_id', productId).eq('size', size);
      } else {
        await supabase.from('cart_items').update({ quantity }).eq('user_id', req.user.id).eq('product_id', productId).eq('size', size);
      }
    } else {
      if (quantity <= 0) {
        db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?').run(req.user.id, productId, size);
      } else {
        db.prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ? AND size = ?').run(quantity, req.user.id, productId, size);
      }
    }

    res.json({ message: 'Cart updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart.' });
  }
});

// Remove item from cart
router.delete('/:productId/:size', verifyToken, async (req, res) => {
  try {
    const { productId, size } = req.params;
    if (isSupabaseConfigured) {
      await supabase.from('cart_items').delete().eq('user_id', req.user.id).eq('product_id', productId).eq('size', size);
    } else {
      db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?').run(req.user.id, productId, size);
    }
    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item.' });
  }
});

// Clear cart
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      await supabase.from('cart_items').delete().eq('user_id', req.user.id);
    } else {
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    }
    res.json({ message: 'Cart cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart.' });
  }
});

export default router;
