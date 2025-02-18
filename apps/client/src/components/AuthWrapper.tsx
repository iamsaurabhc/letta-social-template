'use client';

import { useAuth } from '@/hooks/useAuth';
import ProtectedLayout from './ProtectedLayout';
import UnauthLayout from './UnauthLayout';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return user ? (
    <ProtectedLayout>{children}</ProtectedLayout>
  ) : (
    <UnauthLayout>{children}</UnauthLayout>
  );
} 