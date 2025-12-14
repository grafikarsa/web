'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeValue } from '@/lib/hooks/use-theme-value';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Home, Compass, User, Plus, Search, Pencil, Settings, Shield } from 'lucide-react';

export function StudentSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { theme, mounted } = useThemeValue();

  const navItems = [
    { href: '/', label: 'Feed', icon: Home, exact: true },
    { href: '/portfolios', label: 'Explore', icon: Compass },
    { href: `/${user?.username}/portfolios/new`, label: 'Buat Portofolio', icon: Plus },
    { href: '/users', label: 'Cari User', icon: Search },
    { href: `/${user?.username}`, label: 'Profil Saya', icon: User },
  ];

  const isActive = (href: string, exact?: boolean) => {
    const basePath = href.split('#')[0];
    if (exact) return pathname === basePath;
    return pathname === basePath || (basePath !== '/' && pathname.startsWith(basePath));
  };

  const logoSrc = theme === 'dark' 
    ? '/images/logos/logo_white.svg' 
    : '/images/logos/logo_black.svg';

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center border-r bg-muted/40 py-4">
        {/* Logo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            >
              {mounted && (
                <Image
                  src={logoSrc}
                  alt="Grafikarsa"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Grafikarsa</TooltipContent>
        </Tooltip>

        {/* Navigation - Centered */}
        <nav className="flex flex-1 flex-col items-center justify-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                      active
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* User Profile Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="mt-auto">
              <Avatar className="h-10 w-10 cursor-pointer border-2 border-transparent transition-all hover:border-primary">
                <AvatarImage src={user?.avatar_url} alt={user?.nama} />
                <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
                  {user?.nama?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-64 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={user?.avatar_url} alt={user?.nama} />
                  <AvatarFallback className="bg-primary text-lg font-medium text-primary-foreground">
                    {user?.nama?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-semibold">{user?.nama}</p>
                  <p className="truncate text-sm text-muted-foreground">@{user?.username}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="truncate text-right">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kelas</span>
                  <span>{user?.kelas?.nama || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="capitalize">{user?.role}</span>
                </div>
              </div>

              <Link href={`/${user?.username}/edit`}>
                <Button size="sm" variant="outline" className="w-full gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit Profil
                </Button>
              </Link>

              {/* Admin Panel Link - Show for admin or users with special roles */}
              {(user?.role === 'admin' || (user?.special_roles && user.special_roles.length > 0)) && (
                <>
                  <Separator />
                  <Link href="/admin">
                    <Button size="sm" variant="default" className="w-full gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </aside>
    </TooltipProvider>
  );
}
