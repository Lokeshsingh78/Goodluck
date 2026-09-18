import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== '<YOUR_SUPABASE_PROJECT_URL>' &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseSecretKey &&
  supabaseSecretKey !== '<YOUR_SUPABASE_SECRET_KEY>' &&
  supabaseSecretKey !== '<YOUR_SUPABASE_SERVICE_ROLE_KEY>'
);

if (isSupabaseConfigured) {
  console.log('⚡ Connected to Supabase PostgreSQL & Storage');
} else {
  console.log('ℹ️ Supabase environment variables not configured yet. Using local fallback database.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

/**
 * Auto-seeds default admin user, categories, and initial products in Supabase PostgreSQL
 * if the database tables are empty when Supabase is enabled.
 */
export async function seedSupabaseIfEmpty() {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    // 1. Seed Categories if empty
    const { data: existingCats } = await supabase.from('categories').select('id');
    if (!existingCats || existingCats.length === 0) {
      await supabase.from('categories').insert([
        { name: 'Oversized T-Shirts', slug: 'oversized-t-shirts', description: 'Heavyweight organic cotton statement tees' },
        { name: 'Accessories', slug: 'accessories', description: 'Statement accessories and caps' }
      ]);
      console.log('🌱 Seeded default categories in Supabase');
    }

    // 2. Seed Default Admin User if missing
    const { data: adminUser } = await supabase.from('users').select('id').eq('email', 'admin@goodlucksociety.in').single();
    if (!adminUser) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await supabase.from('users').insert([{
        email: 'admin@goodlucksociety.in',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        phone: '+919876543210',
        address: 'Good Luck Society HQ, Mumbai, India',
        is_active: true
      }]);
      console.log('🔑 Seeded default Admin user in Supabase (admin@goodlucksociety.in)');
    }

    // 3. Seed Products if empty
    const { data: existingProds } = await supabase.from('products').select('id');
    if (!existingProds || existingProds.length === 0) {
      const initialProducts = [
        {
          id: 'my-man-oversized-t-shirt',
          name: 'My Man Oversized T-Shirt',
          price: 1499.00,
          discount_price: 0,
          rating: 4.9,
          reviews_count: 128,
          quote_front: 'GOOD LUCK',
          quote_back: 'MY MAN IS HOTTER THAN YOU.',
          tag: 'BESTSELLER',
          badge: 'Popular',
          image_front: '/images/better_tshirt.png',
          image_back: '/images/better_tshirt.png',
          images: ['/images/better_tshirt.png'],
          color: 'Deep Black',
          material: '100% Heavy Cotton (200g/m²)',
          fit: 'Signature Oversized Fit',
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          stock: 45,
          in_stock: true,
          description: 'Bold statement front and center. Heavyweight 200 g/m² organic cotton built for a structured boxy drape that turns heads without saying a word.',
          details: ['Heavyweight 200 g/m² 100% Cotton', 'High-density rear statement print', 'Drop shoulder oversized silhouette', 'Pre-shrunk fabric', 'Designed for daily statement wear']
        },
        {
          id: 'dont-talk-oversized-t-shirt',
          name: "Don't Talk To Me Oversized T-Shirt",
          price: 1499.00,
          discount_price: 0,
          rating: 5.0,
          reviews_count: 94,
          quote_front: 'GOOD LUCK',
          quote_back: "DON'T TALK TO ME.",
          tag: 'TRENDING',
          badge: 'Popular',
          image_front: '/images/better_tshirt.png',
          image_back: '/images/better_tshirt.png',
          images: ['/images/better_tshirt.png'],
          color: 'Deep Black',
          material: '100% Heavy Cotton (200g/m²)',
          fit: 'Signature Oversized Fit',
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          stock: 30,
          in_stock: true,
          description: 'For the days you need boundaries without opening your mouth. Premium heavy cotton construction with a clean, unapologetic statement back.',
          details: ['200 g/m² 100% Premium Cotton', 'Bold back typography print', 'Reinforced collar and drop shoulders', 'Zero cracking print guarantee', 'Boxy structured streetwear fit']
        },
        {
          id: 'crazy-boyfriend-oversized-t-shirt',
          name: 'Crazy Boyfriend Oversized T-Shirt',
          price: 1499.00,
          discount_price: 0,
          rating: 4.95,
          reviews_count: 156,
          quote_front: 'GOOD LUCK',
          quote_back: 'I HAVE A CRAZY BOYFRIEND.',
          tag: 'HOT RELEASE',
          badge: 'Bestseller',
          image_front: '/images/better_tshirt.png',
          image_back: '/images/better_tshirt.png',
          images: ['/images/better_tshirt.png'],
          color: 'Deep Black',
          material: '100% Heavy Cotton (200g/m²)',
          fit: 'Signature Oversized Fit',
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          stock: 50,
          in_stock: true,
          description: 'A subtle warning and a major mood. Heavyweight organic cotton cut in a relaxed, comfortable fit that speaks for itself.',
          details: ['Heavyweight 200 g/m² Cotton', 'Ultra soft feel, heavy drape', 'High contrast crisp white back print', 'Durable screen print finish', 'Made in India']
        },
        {
          id: 'crazy-girlfriend-oversized-t-shirt',
          name: 'Crazy Girlfriend Oversized T-Shirt',
          price: 1499.00,
          discount_price: 0,
          rating: 4.88,
          reviews_count: 82,
          quote_front: 'GOOD LUCK',
          quote_back: 'I HAVE A CRAZY GIRLFRIEND.',
          tag: 'ESSENTIAL',
          badge: 'Standard',
          image_front: '/images/better_tshirt.png',
          image_back: '/images/better_tshirt.png',
          images: ['/images/better_tshirt.png'],
          color: 'Deep Black',
          material: '100% Heavy Cotton (200g/m²)',
          fit: 'Signature Oversized Fit',
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          stock: 20,
          in_stock: true,
          description: 'Fair warning to everyone in the room. Boxy oversized cut engineered with heavy 200g cotton for peak comfort and effortless attitude.',
          details: ['100% Heavy Cotton (200 g/m²)', 'Oversized boxy cut', 'High-density screen printed back design', 'Double stitched hems']
        },
        {
          id: 'not-interested-oversized-t-shirt',
          name: "Not Interested Oversized T-Shirt",
          price: 1499.00,
          discount_price: 0,
          rating: 4.92,
          reviews_count: 110,
          quote_front: 'GOOD LUCK',
          quote_back: "I'M NOT INTERESTED.",
          tag: 'STATEMENT',
          badge: 'Popular',
          image_front: '/images/better_tshirt.png',
          image_back: '/images/better_tshirt.png',
          images: ['/images/better_tshirt.png'],
          color: 'Deep Black',
          material: '100% Heavy Cotton (200g/m²)',
          fit: 'Signature Oversized Fit',
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          stock: 35,
          in_stock: true,
          description: 'Saves you five conversations a day. Thick, premium cotton tee with a sharp high-impact rear print.',
          details: ['Heavyweight 200 g/m² cotton construction', 'Oversized silhouette with drop shoulders', 'High durability back typography', 'Machine wash cold safe']
        },
        {
          id: 'you-wish-oversized-t-shirt',
          name: 'You Wish Oversized T-Shirt',
          price: 1499.00,
          discount_price: 0,
          rating: 4.89,
          reviews_count: 75,
          quote_front: 'GOOD LUCK',
          quote_back: 'YOU WISH.',
          tag: 'POPULAR',
          badge: 'Popular',
          image_front: '/images/better_tshirt.png',
          image_back: '/images/better_tshirt.png',
          images: ['/images/better_tshirt.png'],
          color: 'Deep Black',
          material: '100% Heavy Cotton (200g/m²)',
          fit: 'Signature Oversized Fit',
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          stock: 15,
          in_stock: true,
          description: 'Confidence in two words. Heavyweight streetwear fit built to maintain its structure through endless wears.',
          details: ['200 g/m² heavy cotton fabric', 'Screen printed back quote', 'Oversized drop shoulder cut']
        },
        {
          id: 'hes-mine-oversized-t-shirt',
          name: "He's Mine Oversized T-Shirt",
          price: 1499.00,
          discount_price: 0,
          rating: 4.97,
          reviews_count: 204,
          quote_front: 'GOOD LUCK',
          quote_back: "HE'S MINE.",
          tag: 'FAN FAVORITE',
          badge: 'Bestseller',
          image_front: '/images/better_tshirt.png',
          image_back: '/images/better_tshirt.png',
          images: ['/images/better_tshirt.png'],
          color: 'Deep Black',
          material: '100% Heavy Cotton (200g/m²)',
          fit: 'Signature Oversized Fit',
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          stock: 60,
          in_stock: true,
          description: 'Claim your territory. Heavyweight cotton graphic tee featuring crisp white rear typography and a boxy relaxed fit.',
          details: ['100% Heavy Cotton 200 g/m²', 'Iconic back statement design', 'Boxy streetwear fit']
        },
        {
          id: 'shes-mine-oversized-t-shirt',
          name: "She's Mine Oversized T-Shirt",
          price: 1499.00,
          discount_price: 0,
          rating: 4.85,
          reviews_count: 68,
          quote_front: 'GOOD LUCK',
          quote_back: "SHE'S MINE.",
          tag: 'STATEMENT',
          badge: 'Standard',
          image_front: '/images/better_tshirt.png',
          image_back: '/images/better_tshirt.png',
          images: ['/images/better_tshirt.png'],
          color: 'Deep Black',
          material: '100% Heavy Cotton (200g/m²)',
          fit: 'Signature Oversized Fit',
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          stock: 25,
          in_stock: true,
          description: 'Set the record straight. Premium 200g organic cotton statement tee engineered for maximum visual impact.',
          details: ['200 g/m² Cotton', 'Oversized street fit', 'Made in India']
        },
        {
          id: 'stay-out-of-my-way-oversized-t-shirt',
          name: 'Stay Out Of My Way Oversized T-Shirt',
          price: 1499.00,
          discount_price: 0,
          rating: 4.98,
          reviews_count: 112,
          quote_front: 'GOOD LUCK',
          quote_back: 'STAY OUT OF MY WAY.',
          tag: 'NEW RELEASE',
          badge: 'Bestseller',
          image_front: '/images/better_tshirt.png',
          image_back: '/images/better_tshirt.png',
          images: ['/images/better_tshirt.png'],
          color: 'Deep Black',
          material: '100% Heavy Cotton (200g/m²)',
          fit: 'Signature Oversized Fit',
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          stock: 50,
          in_stock: true,
          description: 'Clear boundaries in bold typography. 200 g/m² organic heavyweight cotton with drop-shoulder boxy drape.',
          details: ['Heavyweight 200 g/m² 100% Cotton', 'High-density back statement print', 'Pre-shrunk fabric', 'Oversized boxy cut']
        },
        {
          id: 'too-busy-being-great-oversized-t-shirt',
          name: 'Too Busy Being Great Oversized T-Shirt',
          price: 1499.00,
          discount_price: 0,
          rating: 4.94,
          reviews_count: 98,
          quote_front: 'GOOD LUCK',
          quote_back: 'TOO BUSY BEING GREAT.',
          tag: 'TRENDING',
          badge: 'Popular',
          image_front: '/images/better_tshirt.png',
          image_back: '/images/better_tshirt.png',
          images: ['/images/better_tshirt.png'],
          color: 'Deep Black',
          material: '100% Heavy Cotton (200g/m²)',
          fit: 'Signature Oversized Fit',
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          stock: 40,
          in_stock: true,
          description: 'Focus on the mission. Heavyweight 200g organic combed cotton tee built for effortless daily confidence.',
          details: ['100% Organic Heavy Cotton', 'Resistant screen print back statement', 'Signature drop shoulder fit']
        }
      ];

      await supabase.from('products').insert(initialProducts);
      console.log('🛍️ Seeded initial products catalog in Supabase');
    }
  } catch (err) {
    console.warn('Supabase auto-seed notice:', err.message);
  }
}
