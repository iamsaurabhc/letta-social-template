import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@common/supabase/client';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { User } from '@common/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
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