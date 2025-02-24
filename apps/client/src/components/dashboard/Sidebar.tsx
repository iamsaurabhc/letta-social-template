import { Home, Users, Share2, Settings, BarChart, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'My Agents', href: '/dashboard/agents', icon: Users },
  { name: 'Social Accounts', href: '/dashboard/socials', icon: Share2 },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex-1 px-6 pt-6">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                pathname === item.href ? "bg-accent" : "transparent"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t space-y-2">
        <p className="text-sm text-muted-foreground px-3 pb-4">
          Logged in as {user?.email}
        </p>
        <Button
          onClick={handleSignOut}
          variant="destructive"
          size="sm"
          className="w-full justify-start gap-3"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
} 