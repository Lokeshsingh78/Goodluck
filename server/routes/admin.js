import express from 'express';
import fs from 'fs';
import path from 'path';
import db from '../database.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { logAdminAction } from '../utils/audit.js';
import { createDatabaseBackup } from '../utils/backup.js';
import { clearCache } from '../middleware/cache.js';

const router = express.Router();

// Helper to upload images to Supabase Storage with bucket auto-creation
async function uploadToSupabaseStorage(fileName, fileBuffer, mimeType) {
  try {
    let { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, fileBuffer, { contentType: mimeType || 'image/jpeg', upsert: true });

    if (uploadErr && (uploadErr.message?.includes('not found') || uploadErr.statusCode === '404' || uploadErr.error === 'Bucket not found')) {
      await supabase.storage.createBucket('product-images', { public: true });
      const retry = await supabase.storage
        .from('product-images')
        .upload(fileName, fileBuffer, { contentType: mimeType || 'image/jpeg', upsert: true });
      uploadErr = retry.error;
    }

    if (!uploadErr) {
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      return publicUrlData?.publicUrl || null;
    }
    console.error('Supabase Storage upload warning:', uploadErr.message);
    return null;
  } catch (err) {
    console.error('Supabase Storage upload exception:', err.message);
    return null;
  }
}

// Apply auth & admin middleware to all routes
router.use(verifyToken, requireAdmin);

// Dashboard Statistics
router.get('/stats', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const [{ count: totalUsers }, { count: totalProducts }, { count: totalOrders }, { data: paidOrders }, { count: pendingPayments }, { data: lowStockProducts }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('final_amount').eq('payment_status', 'paid'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).or('payment_status.eq.payment_pending,payment_status.eq.pending'),
        supabase.from('products').select('id, name, stock').lt('stock', 10).eq('is_active', true)
      ]);

      const totalRevenue = (paidOrders || []).reduce((sum, o) => sum + parseFloat(o.final_amount || 0), 0);

      return res.json({
        stats: {
          totalUsers: totalUsers || 0,
          totalProducts: totalProducts || 0,
          totalOrders: totalOrders || 0,
          totalRevenue,
          successfulPayments: (paidOrders || []).length,
          pendingPayments: pendingPayments || 0,
          failedPayments: 0,
          lowStockCount: (lowStockProducts || []).length
        },
        lowStockProducts: lowStockProducts || []
      });
    } else {
      const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;
      const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
      const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;

      const revenueRow = db.prepare("SELECT SUM(final_amount) as total FROM orders WHERE payment_status = 'paid'").get();
      const totalRevenue = (revenueRow && revenueRow.total) || 0;

      const successfulPayments = db.prepare("SELECT COUNT(*) as count FROM payments WHERE status = 'captured'").get().count;
      const pendingPayments = db.prepare("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'payment_pending' OR payment_status = 'pending'").get().count;
      const failedPayments = db.prepare("SELECT COUNT(*) as count FROM payments WHERE status = 'failed'").get().count;

      const lowStockProducts = db.prepare('SELECT id, name, stock FROM products WHERE stock < 10 AND is_active = 1').all();

      return res.json({
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
          successfulPayments,
          pendingPayments,
          failedPayments,
          lowStockCount: lowStockProducts.length
        },
        lowStockProducts
      });
    }
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to calculate stats: ' + err.message });
  }
});

// Admin Product Management
router.get('/products', async (req, res) => {
  try {
    let rows = [];
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      rows = data || [];
    } else {
      rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    }

    const products = rows.map((r) => {
      let parsedImages = [];
      try {
        parsedImages = typeof r.images === 'string' ? JSON.parse(r.images) : (Array.isArray(r.images) ? r.images : []);
      } catch (e) {
        parsedImages = [];
      }
      if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
        parsedImages = [r.image_front, r.image_back].filter(Boolean);
      }
      return {
        ...r,
        price: parseFloat(r.price),
        discountPrice: parseFloat(r.discount_price || 0),
        rating: parseFloat(r.rating || 5.0),
        reviewsCount: parseInt(r.reviews_count || 0),
        sizes: typeof r.sizes === 'string' ? JSON.parse(r.sizes) : (Array.isArray(r.sizes) ? r.sizes : []),
        details: typeof r.details === 'string' ? JSON.parse(r.details) : (Array.isArray(r.details) ? r.details : []),
        images: parsedImages,
        imageFront: r.image_front,
        imageBack: r.image_back,
        inStock: Boolean(r.in_stock),
        isActive: Boolean(r.is_active)
      };
    });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin products: ' + err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const {
      id, name, price, discountPrice = 0, rating = 5.0, reviewsCount = 0,
      quoteFront = 'GOOD LUCK', quoteBack = '', tag = 'NEW', badge = null,
      imageFront, imageBack, images = [], color = 'Deep Black', material = '100% Heavy Cotton',
      fit = 'Signature Oversized Fit', sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      stock = 50, categoryId = 1, description = '', details = []
    } = req.body;

    const imagesList = Array.isArray(images) && images.length > 0
      ? images
      : [imageFront || '/images/better_tshirt.png', imageBack].filter(Boolean);

    const primaryImage = imagesList[0] || imageFront || '/images/better_tshirt.png';
    const secondaryImage = imagesList[1] || imageBack || primaryImage;

    if (!name || !price || !primaryImage) {
      return res.status(400).json({ error: 'Product name, price, and at least one image are required.' });
    }

    const prodId = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (isSupabaseConfigured) {
      const { data: existing } = await supabase.from('products').select('id').eq('id', prodId).single();
      if (existing) {
        return res.status(400).json({ error: 'Product with this ID or slug already exists.' });
      }

      const { error } = await supabase.from('products').insert([{
        id: prodId,
        name,
        price,
        discount_price: discountPrice,
        rating,
        reviews_count: reviewsCount,
        quote_front: quoteFront,
        quote_back: quoteBack,
        tag,
        badge,
        image_front: primaryImage,
        image_back: secondaryImage,
        images: imagesList,
        color,
        material,
        fit,
        sizes,
        stock,
        in_stock: true,
        category_id: categoryId,
        description,
        details,
        is_active: true
      }]);

      if (error) throw error;
    } else {
      const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(prodId);
      if (existing) {
        return res.status(400).json({ error: 'Product with this ID or slug already exists.' });
      }

      db.prepare(`
        INSERT INTO products (
          id, name, price, discount_price, rating, reviews_count,
          quote_front, quote_back, tag, badge, image_front, image_back, images,
          color, material, fit, sizes, stock, in_stock, category_id,
          description, details, is_active
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, 1, ?,
          ?, ?, 1
        )
      `).run(
        prodId, name, price, discountPrice, rating, reviewsCount,
        quoteFront, quoteBack, tag, badge, primaryImage, secondaryImage, JSON.stringify(imagesList),
        color, material, fit, JSON.stringify(sizes), stock, categoryId,
        description, JSON.stringify(details)
      );
    }

    logAdminAction(req.user, 'PRODUCT_CREATED', 'product', prodId, { name, price });
    clearCache('/api/products');
    res.status(201).json({ message: 'Product created successfully.', productId: prodId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product: ' + err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, price, discountPrice, stock, description, quoteBack,
      tag, badge, imageFront, imageBack, images, isActive, categoryId
    } = req.body;

    let imagesList = null;
    let primaryImage = null;
    let secondaryImage = null;

    if (Array.isArray(images) && images.length > 0) {
      imagesList = images;
      primaryImage = images[0];
      secondaryImage = images[1] || images[0];
    } else if (imageFront) {
      primaryImage = imageFront;
      secondaryImage = imageBack || imageFront;
    }

    if (isSupabaseConfigured) {
      const updates = {};
      if (name) updates.name = name;
      if (price !== undefined) updates.price = price;
      if (discountPrice !== undefined) updates.discount_price = discountPrice;
      if (stock !== undefined) {
        updates.stock = stock;
        updates.in_stock = stock > 0;
      }
      if (description !== undefined) updates.description = description;
      if (quoteBack !== undefined) updates.quote_back = quoteBack;
      if (tag !== undefined) updates.tag = tag;
      if (badge !== undefined) updates.badge = badge;
      if (primaryImage) updates.image_front = primaryImage;
      if (secondaryImage) updates.image_back = secondaryImage;
      if (imagesList) updates.images = imagesList;
      if (isActive !== undefined) updates.is_active = Boolean(isActive);
      if (categoryId !== undefined) updates.category_id = categoryId;
      updates.updated_at = new Date().toISOString();

      const { error } = await supabase.from('products').update(updates).eq('id', id);
      if (error) throw error;
    } else {
      const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      db.prepare(`
        UPDATE products SET
          name = COALESCE(?, name),
          price = COALESCE(?, price),
          discount_price = COALESCE(?, discount_price),
          stock = COALESCE(?, stock),
          description = COALESCE(?, description),
          quote_back = COALESCE(?, quote_back),
          tag = COALESCE(?, tag),
          badge = CASE WHEN ? IS NOT NULL THEN ? ELSE badge END,
          image_front = COALESCE(?, image_front),
          image_back = COALESCE(?, image_back),
          images = COALESCE(?, images),
          is_active = COALESCE(?, is_active),
          category_id = COALESCE(?, category_id),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        name, price, discountPrice, stock, description, quoteBack,
        tag, badge !== undefined ? badge : null, badge !== undefined ? badge : null,
        primaryImage, secondaryImage, imagesList ? JSON.stringify(imagesList) : null,
        isActive !== undefined ? (isActive ? 1 : 0) : null, categoryId,
        id
      );
    }

    logAdminAction(req.user, 'PRODUCT_UPDATED', 'product', id, { name, price });
    clearCache('/api/products');
    res.json({ message: 'Product updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product: ' + err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } else {
      db.prepare('DELETE FROM products WHERE id = ?').run(id);
    }
    logAdminAction(req.user, 'PRODUCT_DELETED', 'product', id);
    clearCache('/api/products');
    res.json({ message: 'Product deleted permanently.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product: ' + err.message });
  }
});

// Admin Single Image Upload (Pushes to Supabase Storage if configured)
router.post('/upload-image', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Image upload failed: ' + err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
      let imageUrl = `/uploads/${req.file.filename}`;

      if (isSupabaseConfigured) {
        const fileBuffer = req.file.buffer || (req.file.path ? fs.readFileSync(req.file.path) : null);
        if (fileBuffer) {
          const fileName = `prod-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(req.file.originalname) || '.png'}`;
          const supabaseUrl = await uploadToSupabaseStorage(fileName, fileBuffer, req.file.mimetype);
          if (supabaseUrl) {
            imageUrl = supabaseUrl;
          }
        }
      }

      logAdminAction(req.user, 'PRODUCT_IMAGE_UPLOADED', 'product', null, { imageUrl });
      res.json({ message: 'Image uploaded successfully.', imageUrl });
    } catch (uploadException) {
      res.status(500).json({ error: 'Failed to process image upload: ' + uploadException.message });
    }
  });
});

// Admin Multiple Images Upload (Pushes to Supabase Storage if configured)
router.post('/products/upload-multiple', (req, res) => {
  upload.array('images', 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Image upload failed: ' + err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded.' });
    }

    try {
      const imageUrls = [];

      for (const file of req.files) {
        let imageUrl = `/uploads/${file.filename}`;
        if (isSupabaseConfigured) {
          const fileBuffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
          if (fileBuffer) {
            const fileName = `prod-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname) || '.png'}`;
            const supabaseUrl = await uploadToSupabaseStorage(fileName, fileBuffer, file.mimetype);
            if (supabaseUrl) {
              imageUrl = supabaseUrl;
            }
          }
        }
        imageUrls.push(imageUrl);
      }

      logAdminAction(req.user, 'PRODUCT_MULTIPLE_IMAGES_UPLOADED', 'product', null, { count: req.files.length, imageUrls });
      res.json({ message: 'Images uploaded successfully.', imageUrls });
    } catch (uploadException) {
      res.status(500).json({ error: 'Failed to process multiple uploads: ' + uploadException.message });
    }
  });
});

// Admin Order Management
router.get('/orders', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data: orders, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (error) throw error;
      const result = (orders || []).map(o => ({ ...o, items: o.order_items || [] }));
      return res.json({ orders: result });
    } else {
      const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
      const result = orders.map((ord) => {
        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
        return { ...ord, items };
      });
      return res.json({ orders: result });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const { id } = req.params;

    if (isSupabaseConfigured) {
      const updates = {};
      if (status) updates.status = status;
      if (paymentStatus) updates.payment_status = paymentStatus;
      await supabase.from('orders').update(updates).eq('id', id);
    } else {
      db.prepare(`
        UPDATE orders
        SET status = COALESCE(?, status),
            payment_status = COALESCE(?, payment_status)
        WHERE id = ?
      `).run(status, paymentStatus, id);
    }

    logAdminAction(req.user, 'ORDER_STATUS_UPDATED', 'order', id, { status, paymentStatus });
    res.json({ message: 'Order status updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Admin User Management
router.get('/users', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data: users, error } = await supabase.from('users').select('id, email, name, role, phone, address, is_active, created_at').order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ users: users || [] });
    } else {
      const users = db.prepare('SELECT id, email, name, role, phone, address, is_active, created_at FROM users ORDER BY created_at DESC').all();
      return res.json({ users });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const { id } = req.params;

    if (isSupabaseConfigured) {
      const updates = {};
      if (isActive !== undefined) updates.is_active = Boolean(isActive);
      if (role) updates.role = role;
      await supabase.from('users').update(updates).eq('id', id);
    } else {
      db.prepare(`
        UPDATE users
        SET is_active = COALESCE(?, is_active),
            role = COALESCE(?, role)
        WHERE id = ?
      `).run(isActive !== undefined ? (isActive ? 1 : 0) : null, role, id);
    }

    logAdminAction(req.user, 'USER_STATUS_UPDATED', 'user', id, { isActive, role });
    res.json({ message: 'User status updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// Admin Shipping Tracking Update
router.put('/orders/:id/shipping', async (req, res) => {
  try {
    const { id } = req.params;
    const { carrierName, trackingNumber, status, estimatedDelivery } = req.body;

    const shippedAt = (status === 'shipped' || status === 'out_for_delivery' || status === 'delivered') ? new Date().toISOString() : null;

    if (isSupabaseConfigured) {
      const updates = {};
      if (carrierName) updates.carrier_name = carrierName;
      if (trackingNumber) updates.tracking_number = trackingNumber;
      if (status) updates.status = status;
      if (shippedAt) updates.shipped_at = shippedAt;
      if (estimatedDelivery) updates.estimated_delivery = estimatedDelivery;

      await supabase.from('orders').update(updates).eq('id', id);
    } else {
      db.prepare(`
        UPDATE orders
        SET carrier_name = COALESCE(?, carrier_name),
            tracking_number = COALESCE(?, tracking_number),
            status = COALESCE(?, status),
            shipped_at = COALESCE(?, shipped_at),
            estimated_delivery = COALESCE(?, estimated_delivery)
        WHERE id = ?
      `).run(carrierName || null, trackingNumber || null, status || null, shippedAt, estimatedDelivery || null, id);
    }

    logAdminAction(req.user, 'ORDER_SHIPPING_UPDATED', 'order', id, { carrierName, trackingNumber, status });
    res.json({ message: 'Shipping tracking information updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update shipping info.' });
  }
});

// Admin Audit Logs API
router.get('/audit-logs', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data: logs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      return res.json({ logs: logs || [] });
    } else {
      const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();
      return res.json({ logs });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

// Admin Payments Log List
router.get('/payments', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data: payments, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ payments: payments || [] });
    } else {
      const payments = db.prepare('SELECT * FROM payments ORDER BY created_at DESC').all();
      return res.json({ payments: payments || [] });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments log: ' + err.message });
  }
});

export default router;
