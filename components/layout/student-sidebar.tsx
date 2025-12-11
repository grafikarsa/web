'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, Search, Compass, User, FolderOpen, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { ThemeToggle } from './theme-toggle';
import { SearchPanel } from '@/components/search/search-panel';

export function StudentSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout, isLogoutPending } = useAuth();

  const navItems = [
    { href: '/', label: 'Feed', icon: Home },
    { href: '/portfolios', label: 'Explore', icon: Compass },
    { href: `/${user?.username}`, label: 'Profil Saya', icon: User },
    { href: `/${user?.username}#portfolios`, label: 'Portofolio', icon: FolderOpen },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="text-xl font-bold text-primary">
            Grafikarsa
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href.split('#')[0]));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          {/* Search Panel */}
          <SearchPanel
            trigger={
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Search className="h-5 w-5" />
                Search
              </button>
            }
          />

          {/* Create Portfolio Button */}
          <Link href={`/${user?.username}/portfolios/new`}>
            <Button className="mt-4 w-full gap-2">
              <Plus className="h-4 w-4" />
              Buat Portofolio
            </Button>
          </Link>
        </nav>

        {/* User Info & Actions */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar_url} alt={user?.nama} />
              <AvatarFallback>{user?.nama?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.nama}</p>
              <p className="truncate text-xs text-muted-foreground">@{user?.username}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              disabled={isLogoutPending}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
