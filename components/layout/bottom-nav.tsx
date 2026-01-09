'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusSquare, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuthStore();

    if (!user) return null;

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background px-6 pb-2 pt-2 md:hidden">
            <nav className="flex items-center justify-between">
                <Link href="/" className={cn("flex flex-col items-center gap-1", isActive('/') && pathname === '/' ? "text-primary" : "text-muted-foreground")}>
                    <Home className="h-6 w-6" />
                    <span className="text-[10px]">Home</span>
                </Link>

                <Link href="/portfolios" className={cn("flex flex-col items-center gap-1", isActive('/portfolios') ? "text-primary" : "text-muted-foreground")}>
                    <Compass className="h-6 w-6" />
                    <span className="text-[10px]">Explore</span>
                </Link>

                {/* Upload FAB-like item */}
                <Link href="/portfolios/new" className="flex flex-col items-center gap-1 -mt-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background">
                        <PlusSquare className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-medium">Upload</span>
                </Link>

                <Link href="/notifications" className={cn("flex flex-col items-center gap-1", isActive('/notifications') ? "text-primary" : "text-muted-foreground")}>
                    <Bell className="h-6 w-6" />
                    <span className="text-[10px]">Notif</span>
                </Link>

                <Link href={`/${user.username}`} className={cn("flex flex-col items-center gap-1", isActive(`/${user.username}`) ? "text-primary" : "text-muted-foreground")}>
                    <User className="h-6 w-6" />
                    <span className="text-[10px]">Profil</span>
                </Link>
            </nav>
        </div>
    );
}
