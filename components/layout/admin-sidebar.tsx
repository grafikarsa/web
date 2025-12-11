'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  ClipboardCheck,
  GraduationCap,
  School,
  Calendar,
  Tags,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/portfolios', label: 'Portfolios', icon: FolderOpen },
  { href: '/admin/moderation', label: 'Moderation', icon: ClipboardCheck },
  { href: '/admin/majors', label: 'Jurusan', icon: GraduationCap },
  { href: '/admin/classes', label: 'Kelas', icon: School },
  { href: '/admin/academic-years', label: 'Tahun Ajaran', icon: Calendar },
  { href: '/admin/tags', label: 'Tags', icon: Tags },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout, isLogoutPending } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Admin Panel</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

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
              <p className="truncate text-xs text-muted-foreground">Admin</p>
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
