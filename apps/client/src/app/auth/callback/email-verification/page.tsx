'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseClient } from '@common/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export default function EmailVerificationPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseClient();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1)); // Remove the # symbol
        const accessToken = hashParams.get('access_token');
        
        if (!accessToken) {
          throw new Error('No access token found');
        }

        // Set the session with the received tokens
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });

        if (error) throw error;
        setStatus('success');
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
      }
    };

    handleEmailVerification();
  }, []);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4">Verifying your email...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold">Email Verified Successfully!</h2>
              <p className="mt-2 text-gray-600">Your email has been verified. You can now continue to your dashboard.</p>
              <Button onClick={handleContinue} className="mt-6 w-full">
                Continue to Dashboard
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold">Verification Failed</h2>
              <p className="mt-2 text-gray-600">There was an error verifying your email. Please try again or contact support.</p>
              <Button onClick={() => router.push('/login')} className="mt-6 w-full">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 