'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { MessageSquareText, LogOut, ChevronLeft, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
    const router = useRouter();
    const { logout, isLogoutPending } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold">Pengaturan</h1>
            </header>

            {/* Content */}
            <div className="p-4 space-y-2">
                {/* Theme */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <p className="font-medium">Tema</p>
                        <p className="text-sm text-muted-foreground">Ubah tampilan terang/gelap</p>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Feedback */}
                <button
                    onClick={() => router.push('/feedback')}
                    className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted"
                >
                    <MessageSquareText className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                        <p className="font-medium">Kirim Feedback</p>
                        <p className="text-sm text-muted-foreground">Sampaikan saran atau laporkan bug</p>
                    </div>
                </button>

                <Separator className="my-4" />

                {/* Logout */}
                <Button
                    variant="destructive"
                    className="w-full justify-start gap-4"
                    onClick={() => logout()}
                    disabled={isLogoutPending}
                >
                    {isLogoutPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <LogOut className="h-5 w-5" />
                    )}
                    <span>Keluar dari Akun</span>
                </Button>
            </div>
        </div>
    );
}
