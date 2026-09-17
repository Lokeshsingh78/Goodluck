import express from 'express';
import db from '../database.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';

const router = express.Router();

function parseProduct(row) {
  if (!row) return null;
  let parsedImages = [];
  try {
    parsedImages = typeof row.images === 'string' ? JSON.parse(row.images) : (Array.isArray(row.images) ? row.images : []);
  } catch (e) {
    parsedImages = [];
  }
  if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
    parsedImages = [row.image_front, row.image_back].filter(Boolean);
  }

  let parsedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  try {
    parsedSizes = typeof row.sizes === 'string' ? JSON.parse(row.sizes) : (Array.isArray(row.sizes) ? row.sizes : parsedSizes);
  } catch (e) {}

  let parsedDetails = [];
  try {
    parsedDetails = typeof row.details === 'string' ? JSON.parse(row.details) : (Array.isArray(row.details) ? row.details : []);
  } catch (e) {}

  return {
    id: row.id,
    name: row.name,
    price: parseFloat(row.price),
    discountPrice: parseFloat(row.discount_price || 0),
    rating: parseFloat(row.rating || 5.0),
    reviewsCount: parseInt(row.reviews_count || 0),
    quoteFront: row.quote_front,
    quoteBack: row.quote_back,
    tag: row.tag,
    badge: row.badge,
    imageFront: row.image_front,
    imageBack: row.image_back,
    images: parsedImages,
    color: row.color,
    material: row.material,
    fit: row.fit,
    sizes: parsedSizes,
    stock: parseInt(row.stock || 0),
    inStock: Boolean(row.in_stock),
    categoryId: row.category_id,
    description: row.description,
    details: parsedDetails,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at
  };
}

// Get all products
router.get('/', async (req, res) => {
  try {
    const { search, category, filter, sort } = req.query;

    if (isSupabaseConfigured) {
      let query = supabase.from('products').select('*').eq('is_active', true);

      if (search) {
        query = query.or(`name.ilike.%${search}%,quote_back.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (category) {
        query = query.eq('category_id', category);
      }
      if (filter === 'BESTSELLERS') {
        query = query.or('badge.eq.Bestseller,rating.gte.4.95');
      } else if (filter === 'POPULAR') {
        query = query.eq('badge', 'Popular');
      }

      if (sort === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (sort === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else if (sort === 'rating') {
        query = query.order('rating', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: rows, error } = await query;
      if (error) throw error;
      const products = (rows || []).map(parseProduct);
      return res.json({ products });
    } else {
      let sql = 'SELECT * FROM products WHERE is_active = 1';
      const params = [];

      if (search) {
        sql += ' AND (name LIKE ? OR quote_back LIKE ? OR description LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      if (category) {
        sql += ' AND category_id = ?';
        params.push(category);
      }

      if (filter === 'BESTSELLERS') {
        sql += " AND (badge = 'Bestseller' OR rating >= 4.95)";
      } else if (filter === 'POPULAR') {
        sql += " AND badge = 'Popular'";
      }

      if (sort === 'price_asc') {
        sql += ' ORDER BY price ASC';
      } else if (sort === 'price_desc') {
        sql += ' ORDER BY price DESC';
      } else if (sort === 'rating') {
        sql += ' ORDER BY rating DESC';
      } else {
        sql += ' ORDER BY created_at DESC';
      }

      const rows = db.prepare(sql).all(...params);
      const products = rows.map(parseProduct);

      res.json({ products });
    }
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch products: ' + err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    let row = null;
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('products').select('*').eq('id', req.params.id).single();
      row = data;
    } else {
      row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    }

    if (!row) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ product: parseProduct(row) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product details.' });
  }
});

export default router;
