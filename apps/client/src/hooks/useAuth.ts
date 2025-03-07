'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@common/supabase/client';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { User } from '@common/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Only create client on mount
  const supabase = typeof window !== 'undefined' ? createSupabaseClient() : null;

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return null;
    try {
      const response = await api.post('/auth/signin', { email, password });
      const { session } = response.data;
      
      if (session) {
        await supabase.auth.setSession(session);
        return session;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/signup', { email, password });
      return response.data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/login');
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}; 