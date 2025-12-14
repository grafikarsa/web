'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { useThemeValue } from '@/lib/hooks/use-theme-value';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from '@/components/notifications/notification-bell';

const pageTitles: Record<string, string> = {
  '/': 'Feed',
  '/search': 'Search',
  '/portfolios': 'Explore Portofolio',
  '/users': 'Siswa & Alumni',
};

export function StudentHeader() {
  const pathname = usePathname();
  const { logout, isLogoutPending } = useAuth();
  const { theme, mounted } = useThemeValue();

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.includes('/edit')) return 'Edit Profil';
    if (pathname.includes('/portfolios/new')) return 'Buat Portofolio';
    if (pathname.includes('/followers')) return 'Followers';
    if (pathname.includes('/following')) return 'Following';
    return '';
  };

  const title = getTitle();

  const logoSrc =
    theme === 'dark'
      ? '/images/logos/logo_white.svg'
      : '/images/logos/logo_black.svg';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-6">
      <h1 className="text-lg font-semibold">{title || 'Grafikarsa'}</h1>

      {/* Center Logo */}
      <Link
        href="/"
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
      >
        {mounted && (
          <Image
            src={logoSrc}
            alt="Grafikarsa"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        )}
        <span className="font-semibold">Grafikarsa</span>
      </Link>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          disabled={isLogoutPending}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
