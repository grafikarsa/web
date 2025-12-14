'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { GuestNavbar, StudentSidebar, StudentHeader, Footer } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
        <Skeleton className="mx-auto h-4 w-32" />
      </div>
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'admin') {
      router.push('/admin');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // If admin, show loading while redirecting
  if (isAuthenticated && user?.role === 'admin') {
    return <LoadingScreen />;
  }

  // Guest layout
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <GuestNavbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  // Authenticated student/alumni layout
  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <div className="flex flex-1 flex-col pl-16">
        <StudentHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
