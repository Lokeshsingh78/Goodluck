import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
