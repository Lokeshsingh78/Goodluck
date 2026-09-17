import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../server/data/goodluck.db');
const uploadsDir = path.join(__dirname, '../public/uploads');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseSecretKey || supabaseUrl.includes('your-project-id')) {
  console.error('❌ Error: Missing or invalid SUPABASE_URL / SUPABASE_SECRET_KEY in .env file.');
  process.exit(1);
}

// Mask secret key details safely in logs
const keyType = supabaseSecretKey.startsWith('sb_secret') || supabaseSecretKey.startsWith('eyJ')
  ? 'Service-Role / Secret Key (Full Administrative Access)'
  : `Publishable / Anon Key (${supabaseSecretKey.length} chars)`;

console.log('🚀 Starting Production-Grade SQLite → Supabase Migration...');
console.log(`🔗 Target Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Credentials: ${keyType}\n`);

const sqlite = new Database(dbPath);
const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const summaryStats = [];
let totalMigrationErrors = 0;

function logSummary(table, totalRows, succeeded, failed, errorMessage = null) {
  summaryStats.push({ table, totalRows, succeeded, failed, errorMessage });
  if (failed > 0) {
    totalMigrationErrors += failed;
  }
}

async function runMigration() {
  // 1. Upload Local Images to Supabase Storage
  console.log('📦 Step 1: Syncing Storage Bucket "product-images"...');
  let imageSuccess = 0;
  let imageFailed = 0;

  try {
    const { data: buckets, error: bucketListErr } = await supabase.storage.listBuckets();
    if (bucketListErr) {
      console.warn('  ⚠️ Bucket listing notice:', bucketListErr.message);
    }

    const bucketExists = buckets && buckets.some(b => b.name === 'product-images');
    if (!bucketExists) {
      console.log('  🔨 Creating bucket "product-images"...');
      const { error: createErr } = await supabase.storage.createBucket('product-images', { public: true });
      if (createErr) {
        console.warn('  ⚠️ Bucket creation notice:', createErr.message);
      }
    }

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        if (fs.lstatSync(filePath).isFile()) {
          const fileBuffer = fs.readFileSync(filePath);
          const { error } = await supabase.storage
            .from('product-images')
            .upload(file, fileBuffer, {
              contentType: file.endsWith('.png') ? 'image/png' : 'image/jpeg',
              upsert: true
            });

          if (error) {
            console.warn(`  ⚠️ Upload notice for ${file}:`, error.message);
            imageFailed++;
          } else {
            console.log(`  ✅ Uploaded image: ${file}`);
            imageSuccess++;
          }
        }
      }
    }
  } catch (err) {
    console.error('  ❌ Storage migration error:', err.message);
    imageFailed++;
  }
  logSummary('product-images (storage)', imageSuccess + imageFailed, imageSuccess, imageFailed);

  console.log('\n📊 Step 2: Migrating Table Data in Strict Dependency Order...\n');

  async function migrateTable(tableName, fetchFn, onConflictKey = 'id') {
    let rows = [];
    try {
      rows = fetchFn();
    } catch (err) {
      console.log(`  ℹ️ SQLite table "${tableName}" not found or empty.`);
      logSummary(tableName, 0, 0, 0);
      return;
    }

    if (!rows || rows.length === 0) {
      console.log(`  ℹ️ No rows to migrate for "${tableName}".`);
      logSummary(tableName, 0, 0, 0);
      return;
    }

    const { error } = await supabase.from(tableName).upsert(rows, { onConflict: onConflictKey });
    if (error) {
      console.error(`  ❌ Error migrating "${tableName}": ${error.message}`);
      logSummary(tableName, rows.length, 0, rows.length, error.message);
    } else {
      console.log(`  ✅ Successfully migrated ${rows.length} rows into "${tableName}".`);
      logSummary(tableName, rows.length, rows.length, 0);
    }
  }

  // Strict Dependency Order:
  // 1. Categories (Parent of products)
  await migrateTable('categories', () => sqlite.prepare('SELECT * FROM categories').all(), 'id');

  // 2. Users (Parent of orders, addresses, cart_items, wishlist)
  await migrateTable('users', () => 
    sqlite.prepare('SELECT * FROM users').all().map(u => ({
      ...u,
      is_active: Boolean(u.is_active)
    })),
    'id'
  );

  // 3. Products (Depends on categories)
  await migrateTable('products', () => 
    sqlite.prepare('SELECT * FROM products').all().map(p => ({
      ...p,
      in_stock: Boolean(p.in_stock),
      is_active: Boolean(p.is_active),
      images: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : [],
      sizes: p.sizes ? (typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes) : [],
      details: p.details ? (typeof p.details === 'string' ? JSON.parse(p.details) : p.details) : []
    })),
    'id'
  );

  // 4. Orders (Depends on users)
  await migrateTable('orders', () => sqlite.prepare('SELECT * FROM orders').all(), 'id');

  // 5. Order Items (Depends on orders & products)
  await migrateTable('order_items', () => sqlite.prepare('SELECT * FROM order_items').all(), 'id');

  // 6. Payments (Depends on orders)
  await migrateTable('payments', () => 
    sqlite.prepare('SELECT * FROM payments').all().map(p => ({
      ...p,
      raw_response: p.raw_response ? (typeof p.raw_response === 'string' ? JSON.parse(p.raw_response) : p.raw_response) : null
    })),
    'id'
  );

  // 7. User Addresses (Depends on users)
  await migrateTable('user_addresses', () => 
    sqlite.prepare('SELECT * FROM user_addresses').all().map(a => ({
      ...a,
      is_default: Boolean(a.is_default)
    })),
    'id'
  );

  // 8. Coupons (Standalone)
  await migrateTable('coupons', () => 
    sqlite.prepare('SELECT * FROM coupons').all().map(c => ({
      ...c,
      is_active: Boolean(c.is_active)
    })),
    'id'
  );

  // 9. Cart Items (Depends on users & products)
  await migrateTable('cart_items', () => sqlite.prepare('SELECT * FROM cart_items').all(), 'id');

  // 10. Wishlist (Depends on users & products)
  await migrateTable('wishlist', () => sqlite.prepare('SELECT * FROM wishlist').all(), 'user_id,product_id');

  // 11. Audit Logs (Standalone)
  await migrateTable('audit_logs', () => sqlite.prepare('SELECT * FROM audit_logs').all(), 'id');

  // 3. Reset PostgreSQL Identity Sequences to MAX(id)
  console.log('\n🔄 Step 3: Synchronizing PostgreSQL Identity Sequences...');
  try {
    const { error: resetErr } = await supabase.rpc('reset_identity_sequences');
    if (resetErr) {
      console.warn('  ⚠️ Notice resetting sequences:', resetErr.message);
    } else {
      console.log('  ✅ Successfully synchronized PostgreSQL identity sequences with MAX(id).');
    }
  } catch (seqErr) {
    console.warn('  ⚠️ Sequence synchronization notice:', seqErr.message);
  }

  // Print Clear Summary Table
  console.log('\n================================================================');
  console.log('                 MIGRATION EXECUTION SUMMARY                    ');
  console.log('================================================================');
  console.table(summaryStats.map(s => ({
    Table: s.table,
    'Total Rows': s.totalRows,
    Succeeded: s.succeeded,
    Failed: s.failed,
    Status: s.failed === 0 ? '✅ OK' : '❌ FAILED'
  })));

  if (totalMigrationErrors > 0) {
    console.error(`\n❌ Migration finished WITH ${totalMigrationErrors} ERROR(S).`);
    const hasIdentityErr = summaryStats.some(s => s.errorMessage && s.errorMessage.includes('identity column'));
    if (hasIdentityErr) {
      console.log('\n💡 FIX REQUIRED: Existing tables in Supabase have GENERATED ALWAYS identity columns.');
      console.log('   Please run the ALTER queries from server/schema.sql in your Supabase SQL Editor:');
      console.log('   ALTER TABLE users ALTER COLUMN id SET GENERATED BY DEFAULT;');
      console.log('   ALTER TABLE categories ALTER COLUMN id SET GENERATED BY DEFAULT;');
      console.log('   ALTER TABLE order_items ALTER COLUMN id SET GENERATED BY DEFAULT;');
      console.log('   ALTER TABLE payments ALTER COLUMN id SET GENERATED BY DEFAULT;');
      console.log('   ALTER TABLE cart_items ALTER COLUMN id SET GENERATED BY DEFAULT;');
      console.log('   ALTER TABLE user_addresses ALTER COLUMN id SET GENERATED BY DEFAULT;');
      console.log('   ALTER TABLE coupons ALTER COLUMN id SET GENERATED BY DEFAULT;');
      console.log('   ALTER TABLE audit_logs ALTER COLUMN id SET GENERATED BY DEFAULT;');
      console.log('   ALTER TABLE wishlist ALTER COLUMN id SET GENERATED BY DEFAULT;');
    }
    process.exit(1);
  } else {
    console.log('\n✨ SQLite → Supabase Migration Completed Successfully with 0 Errors!');
  }
}

runMigration().catch(err => {
  console.error('\n❌ Fatal migration error:', err);
  process.exit(1);
});
