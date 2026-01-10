'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusSquare, User, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuthStore();

    if (!user) return null;

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] border-t bg-background px-2 pb-safe-bottom pt-2 md:hidden">
            <nav className="flex items-center justify-around">
                <Link
                    href="/"
                    className={cn(
                        "flex flex-col items-center gap-0.5 p-2 min-w-[56px]",
                        isActive('/') && pathname === '/' ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <Home className="h-5 w-5" />
                    <span className="text-[10px]">Home</span>
                </Link>

                <Link
                    href="/portfolios"
                    className={cn(
                        "flex flex-col items-center gap-0.5 p-2 min-w-[56px]",
                        isActive('/portfolios') ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <Compass className="h-5 w-5" />
                    <span className="text-[10px]">Explore</span>
                </Link>

                {/* Upload FAB-like item */}
                <Link
                    href={`/${user.username}/portfolios/new`}
                    className="flex flex-col items-center gap-0.5 -mt-3 min-w-[56px]"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background">
                        <PlusSquare className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-medium">Upload</span>
                </Link>

                <Link
                    href={`/${user.username}`}
                    className={cn(
                        "flex flex-col items-center gap-0.5 p-2 min-w-[56px]",
                        isActive(`/${user.username}`) ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <User className="h-5 w-5" />
                    <span className="text-[10px]">Profil</span>
                </Link>

                <Link
                    href="/changelog"
                    className={cn(
                        "flex flex-col items-center gap-0.5 p-2 min-w-[56px]",
                        isActive('/changelog') ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <History className="h-5 w-5" />
                    <span className="text-[10px]">Updates</span>
                </Link>
            </nav>
        </div>
    );
}
