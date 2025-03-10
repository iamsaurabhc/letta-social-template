import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

export const createSupabaseClient = (): SupabaseClient<Database> => {
  // Return dummy client during SSR/build
  if (typeof window === 'undefined') {
    return {} as SupabaseClient<Database>;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
};