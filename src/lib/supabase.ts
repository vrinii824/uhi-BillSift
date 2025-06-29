import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

// Check if credentials are placeholders or missing
if (
  !supabaseUrl ||
  supabaseUrl.includes('YOUR_SUPABASE_URL_HERE') ||
  !supabaseAnonKey ||
  supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY_HERE')
) {
  if (typeof window === 'undefined') { // Log warning only on the server
    console.warn(
      'Supabase credentials are not configured or are placeholders in .env. Using a mock client. Database operations will not be persisted.'
    );
  }

  // Provide a mock Supabase client to prevent the app from crashing.
  // This allows development on other features without a real database connection.
  supabase = {
    from: () => ({
      insert: async () => ({ error: null }),
      select: async () => ({ data: [], error: null }),
      update: async () => ({ data: [], error: null }),
      delete: async () => ({ data: [], error: null }),
    }),
  } as unknown as SupabaseClient;
} else {
  // Create a real Supabase client if credentials are provided
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
