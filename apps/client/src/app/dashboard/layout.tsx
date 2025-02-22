'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-screen lg:grid lg:grid-cols-[280px_1fr] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen overflow-auto">
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}