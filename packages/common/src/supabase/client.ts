import { createBrowserClient } from '@supabase/ssr';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export const createSupabaseClient = () => {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Add debugging
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key exists:', !!supabaseKey);

  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client during build time
    if (process.env.NODE_ENV === 'production') {
      return {} as ReturnType<typeof createBrowserClient>;
    }
    throw new Error(
      'Your project\'s URL and Key are required to create a Supabase client!'
    );
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}; 