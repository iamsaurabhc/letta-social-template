import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <span className="font-bold text-2xl sm:text-3xl truncate bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent px-2">
            Template
          </span>
          <Button
            onClick={handleSignOut}
            variant="destructive"
            size="sm"
            className="whitespace-nowrap"
          >
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 