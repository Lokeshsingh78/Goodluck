import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'goodluck.db');
const db = new Database(dbPath);

// Enable WAL mode and Foreign Keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      phone TEXT,
      address TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      email TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      used INTEGER DEFAULT 0,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      discount_price REAL DEFAULT 0,
      rating REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      quote_front TEXT,
      quote_back TEXT,
      tag TEXT,
      badge TEXT,
      image_front TEXT NOT NULL,
      image_back TEXT NOT NULL,
      color TEXT,
      material TEXT,
      fit TEXT,
      sizes TEXT,
      stock INTEGER DEFAULT 50,
      in_stock INTEGER DEFAULT 1,
      category_id INTEGER,
      description TEXT,
      details TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      shipping_fee REAL DEFAULT 0,
      final_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      cashfree_order_id TEXT,
      cashfree_payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      size TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      cashfree_order_id TEXT NOT NULL,
      cashfree_payment_id TEXT,
      cashfree_signature TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      status TEXT DEFAULT 'created',
      raw_response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address_line TEXT NOT NULL,
      city TEXT,
      state TEXT,
      pincode TEXT,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT DEFAULT 'percentage',
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      max_discount REAL DEFAULT NULL,
      usage_limit INTEGER DEFAULT NULL,
      used_count INTEGER DEFAULT 0,
      expires_at DATETIME DEFAULT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      admin_email TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );
  `);

  // Safely alter products table for images column if missing
  const productColumns = db.prepare("PRAGMA table_info(products)").all().map(c => c.name);
  if (!productColumns.includes('images')) {
    db.exec("ALTER TABLE products ADD COLUMN images TEXT;");
  }

  // Safely alter orders table for shipping tracking columns if missing
  const orderColumns = db.prepare("PRAGMA table_info(orders)").all().map(c => c.name);
  if (!orderColumns.includes('carrier_name')) {
    db.exec("ALTER TABLE orders ADD COLUMN carrier_name TEXT;");
  }
  if (!orderColumns.includes('tracking_number')) {
    db.exec("ALTER TABLE orders ADD COLUMN tracking_number TEXT;");
  }
  if (!orderColumns.includes('shipped_at')) {
    db.exec("ALTER TABLE orders ADD COLUMN shipped_at DATETIME;");
  }
  if (!orderColumns.includes('estimated_delivery')) {
    db.exec("ALTER TABLE orders ADD COLUMN estimated_delivery TEXT;");
  }
  if (!orderColumns.includes('cashfree_order_id')) {
    db.exec("ALTER TABLE orders ADD COLUMN cashfree_order_id TEXT;");
  }
  if (!orderColumns.includes('cashfree_payment_id')) {
    db.exec("ALTER TABLE orders ADD COLUMN cashfree_payment_id TEXT;");
  }

  const paymentColumns = db.prepare("PRAGMA table_info(payments)").all().map(c => c.name);
  if (!paymentColumns.includes('cashfree_order_id')) {
    db.exec("ALTER TABLE payments ADD COLUMN cashfree_order_id TEXT;");
  }
  if (!paymentColumns.includes('cashfree_payment_id')) {
    db.exec("ALTER TABLE payments ADD COLUMN cashfree_payment_id TEXT;");
  }
  if (!paymentColumns.includes('cashfree_signature')) {
    db.exec("ALTER TABLE payments ADD COLUMN cashfree_signature TEXT;");
  }

  seedData();
}

function seedData() {
  // Seed Default Categories
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
    insertCat.run('Oversized T-Shirts', 'oversized-t-shirts', 'Heavyweight organic cotton statement tees');
    insertCat.run('Accessories', 'accessories', 'Statement accessories and caps');
  }

  // Seed Default SAFE10 Coupon
  const couponExists = db.prepare('SELECT id FROM coupons WHERE code = ?').get('SAFE10');
  if (!couponExists) {
    db.prepare(`
      INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active)
      VALUES ('SAFE10', 'percentage', 10.0, 0, 1)
    `).run();
  }

  const category = db.prepare('SELECT id FROM categories LIMIT 1').get();
  const categoryId = category ? category.id : 1;

  // Seed Admin User
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@goodlucksociety.in');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (email, password, name, role, phone, address, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run('admin@goodlucksociety.in', hashedPassword, 'Admin User', 'admin', '+919876543210', 'Good Luck Society HQ, Mumbai, India');
  }

  // Seed Sample Regular User
  const userExists = db.prepare('SELECT id FROM users WHERE email = ?').get('user@goodlucksociety.in');
  if (!userExists) {
    const hashedPassword = bcrypt.hashSync('user123', 10);
    db.prepare(`
      INSERT INTO users (email, password, name, role, phone, address, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run('user@goodlucksociety.in', hashedPassword, 'John Doe', 'user', '+919876543211', '123 Fashion Street, Bandra West, Mumbai 400050');
  }

  // Seed Products: Always ensure standard catalog products exist in database via INSERT OR IGNORE
  const initialProducts = [
      {
        id: 'my-man-oversized-t-shirt',
        name: 'My Man Oversized T-Shirt',
        price: 1499.00,
        discount_price: 0,
        rating: 4.9,
        reviewsCount: 128,
        quoteFront: 'GOOD LUCK',
        quoteBack: 'MY MAN IS HOTTER THAN YOU.',
        tag: 'BESTSELLER',
        badge: 'Popular',
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 45,
        inStock: 1,
        description: 'Bold statement front and center. Heavyweight 200 g/m² organic cotton built for a structured boxy drape that turns heads without saying a word.',
        details: JSON.stringify([
          'Heavyweight 200 g/m² 100% Cotton',
          'High-density rear statement print',
          'Drop shoulder oversized silhouette',
          'Pre-shrunk fabric to retain shape',
          'Designed for daily statement wear'
        ])
      },
      {
        id: 'dont-talk-oversized-t-shirt',
        name: "Don't Talk To Me Oversized T-Shirt",
        price: 1499.00,
        discount_price: 0,
        rating: 5.0,
        reviewsCount: 94,
        quoteFront: 'GOOD LUCK',
        quoteBack: "DON'T TALK TO ME.",
        tag: 'TRENDING',
        badge: 'Popular',
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 30,
        inStock: 1,
        description: 'For the days you need boundaries without opening your mouth. Premium heavy cotton construction with a clean, unapologetic statement back.',
        details: JSON.stringify([
          '200 g/m² 100% Premium Cotton',
          'Bold back typography print',
          'Reinforced collar and drop shoulders',
          'Zero cracking print guarantee',
          'Boxy structured streetwear fit'
        ])
      },
      {
        id: 'crazy-boyfriend-oversized-t-shirt',
        name: 'Crazy Boyfriend Oversized T-Shirt',
        price: 1499.00,
        discount_price: 0,
        rating: 4.95,
        reviewsCount: 156,
        quoteFront: 'GOOD LUCK',
        quoteBack: 'I HAVE A CRAZY BOYFRIEND.',
        tag: 'HOT RELEASE',
        badge: 'Bestseller',
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 50,
        inStock: 1,
        description: 'A subtle warning and a major mood. Heavyweight organic cotton cut in a relaxed, comfortable fit that speaks for itself.',
        details: JSON.stringify([
          'Heavyweight 200 g/m² Cotton',
          'Ultra soft feel, heavy drape',
          'High contrast crisp white back print',
          'Durable screen print finish',
          'Made in India'
        ])
      },
      {
        id: 'crazy-girlfriend-oversized-t-shirt',
        name: 'Crazy Girlfriend Oversized T-Shirt',
        price: 1499.00,
        discount_price: 0,
        rating: 4.88,
        reviewsCount: 82,
        quoteFront: 'GOOD LUCK',
        quoteBack: 'I HAVE A CRAZY GIRLFRIEND.',
        tag: 'ESSENTIAL',
        badge: null,
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 20,
        inStock: 1,
        description: 'Fair warning to everyone in the room. Boxy oversized cut engineered with heavy 200g cotton for peak comfort and effortless attitude.',
        details: JSON.stringify([
          '100% Heavy Cotton (200 g/m²)',
          'Oversized boxy cut',
          'High-density screen printed back design',
          'Double stitched hems'
        ])
      },
      {
        id: 'not-interested-oversized-t-shirt',
        name: "Not Interested Oversized T-Shirt",
        price: 1499.00,
        discount_price: 0,
        rating: 4.92,
        reviewsCount: 110,
        quoteFront: 'GOOD LUCK',
        quoteBack: "I'M NOT INTERESTED.",
        tag: 'STATEMENT',
        badge: 'Popular',
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 35,
        inStock: 1,
        description: 'Saves you five conversations a day. Thick, premium cotton tee with a sharp high-impact rear print.',
        details: JSON.stringify([
          'Heavyweight 200 g/m² cotton construction',
          'Oversized silhouette with drop shoulders',
          'High durability back typography',
          'Machine wash cold safe'
        ])
      },
      {
        id: 'you-wish-oversized-t-shirt',
        name: 'You Wish Oversized T-Shirt',
        price: 1499.00,
        discount_price: 0,
        rating: 4.89,
        reviewsCount: 75,
        quoteFront: 'GOOD LUCK',
        quoteBack: 'YOU WISH.',
        tag: 'POPULAR',
        badge: 'Popular',
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 15,
        inStock: 1,
        description: 'Confidence in two words. Heavyweight streetwear fit built to maintain its structure through endless wears.',
        details: JSON.stringify([
          '200 g/m² heavy cotton fabric',
          'Screen printed back quote',
          'Oversized drop shoulder cut'
        ])
      },
      {
        id: 'hes-mine-oversized-t-shirt',
        name: "He's Mine Oversized T-Shirt",
        price: 1499.00,
        discount_price: 0,
        rating: 4.97,
        reviewsCount: 204,
        quoteFront: 'GOOD LUCK',
        quoteBack: "HE'S MINE.",
        tag: 'FAN FAVORITE',
        badge: 'Bestseller',
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 60,
        inStock: 1,
        description: 'Claim your territory. Heavyweight cotton graphic tee featuring crisp white rear typography and a boxy relaxed fit.',
        details: JSON.stringify([
          '100% Heavy Cotton 200 g/m²',
          'Iconic back statement design',
          'Boxy streetwear fit'
        ])
      },
      {
        id: 'shes-mine-oversized-t-shirt',
        name: "She's Mine Oversized T-Shirt",
        price: 1499.00,
        discount_price: 0,
        rating: 4.85,
        reviewsCount: 68,
        quoteFront: 'GOOD LUCK',
        quoteBack: "SHE'S MINE.",
        tag: 'STATEMENT',
        badge: null,
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 25,
        inStock: 1,
        description: 'Set the record straight. Premium 200g organic cotton statement tee engineered for maximum visual impact.',
        details: JSON.stringify([
          '200 g/m² Cotton',
          'Oversized street fit',
          'Made in India'
        ])
      },
      {
        id: 'stay-out-of-my-way-oversized-t-shirt',
        name: 'Stay Out Of My Way Oversized T-Shirt',
        price: 1499.00,
        discount_price: 0,
        rating: 4.98,
        reviewsCount: 112,
        quoteFront: 'GOOD LUCK',
        quoteBack: 'STAY OUT OF MY WAY.',
        tag: 'NEW RELEASE',
        badge: 'Bestseller',
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 50,
        inStock: 1,
        description: 'Clear boundaries in bold typography. 200 g/m² organic heavyweight cotton with drop-shoulder boxy drape.',
        details: JSON.stringify([
          'Heavyweight 200 g/m² 100% Cotton',
          'High-density back statement print',
          'Pre-shrunk fabric',
          'Oversized boxy cut'
        ])
      },
      {
        id: 'too-busy-being-great-oversized-t-shirt',
        name: 'Too Busy Being Great Oversized T-Shirt',
        price: 1499.00,
        discount_price: 0,
        rating: 4.94,
        reviewsCount: 98,
        quoteFront: 'GOOD LUCK',
        quoteBack: 'TOO BUSY BEING GREAT.',
        tag: 'TRENDING',
        badge: 'Popular',
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 40,
        inStock: 1,
        description: 'Focus on the mission. Heavyweight 200g organic combed cotton tee built for effortless daily confidence.',
        details: JSON.stringify([
          '100% Organic Heavy Cotton',
          'Resistant screen print back statement',
          'Signature drop shoulder fit'
        ])
      },
      {
        id: 'not-your-type-oversized-t-shirt',
        name: 'Not Your Type Oversized T-Shirt',
        price: 1499.00,
        discount_price: 0,
        rating: 4.91,
        reviewsCount: 76,
        quoteFront: 'GOOD LUCK',
        quoteBack: 'NOT YOUR TYPE.',
        tag: 'NEW',
        badge: 'Popular',
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 35,
        inStock: 1,
        description: 'Unapologetic statement tee. Premium heavyweight organic cotton cut in a relaxed streetwear silhouette.',
        details: JSON.stringify([
          '200 g/m² Heavyweight Cotton',
          'High contrast rear typography',
          'Made in India'
        ])
      },
      {
        id: 'zero-apologies-oversized-t-shirt',
        name: 'Zero Apologies Oversized T-Shirt',
        price: 1499.00,
        discount_price: 0,
        rating: 4.96,
        reviewsCount: 134,
        quoteFront: 'GOOD LUCK',
        quoteBack: 'ZERO APOLOGIES.',
        tag: 'HOT RELEASE',
        badge: 'Bestseller',
        imageFront: '/images/better_tshirt.png',
        imageBack: '/images/better_tshirt.png',
        color: 'Deep Black',
        material: '100% Heavy Cotton (200g/m²)',
        fit: 'Signature Oversized Fit',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        stock: 60,
        inStock: 1,
        description: 'Own every room you enter. Heavyweight organic cotton streetwear statement tee with thick high-density rear print.',
        details: JSON.stringify([
          '200 g/m² Premium Heavy Cotton',
          'Drop shoulder boxy silhouette',
          'Durable high-density print'
        ])
      }
    ];

    const insertProd = db.prepare(`
      INSERT OR IGNORE INTO products (
        id, name, price, discount_price, rating, reviews_count,
        quote_front, quote_back, tag, badge, image_front, image_back, images,
        color, material, fit, sizes, stock, in_stock, category_id,
        description, details
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?
      )
    `);

    for (const p of initialProducts) {
      insertProd.run(
        p.id, p.name, p.price, p.discount_price, p.rating, p.reviewsCount,
        p.quoteFront, p.quoteBack, p.tag, p.badge, p.imageFront, p.imageBack,
        JSON.stringify([p.imageFront, p.imageBack]),
        p.color, p.material, p.fit, p.sizes, p.stock, p.inStock, categoryId,
        p.description, p.details
      );
    }
}

export default db;
