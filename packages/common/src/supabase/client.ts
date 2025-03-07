import { createBrowserClient } from '@supabase/ssr';

export const createSupabaseClient = () => {
  // Return dummy client during SSR/build
  if (typeof window === 'undefined') {
    return {} as ReturnType<typeof createBrowserClient>;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}; 