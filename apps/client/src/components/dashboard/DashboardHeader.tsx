import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 className="hidden sm:block text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
        Dashboard
      </h2>
      <div className="flex items-center">
        <Button 
          onClick={() => router.push('/dashboard/automation')}
          className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Add Automation</span>
          <span className="sm:hidden">Add Automation</span>
        </Button>
      </div>
    </div>
  );
} 