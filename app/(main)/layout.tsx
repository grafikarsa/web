'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { GuestNavbar, StudentSidebar, StudentHeader, Footer } from '@/components/layout';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';
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
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Check if user has admin access
  const hasAdminAccess =
    user?.role === 'admin' ||
    (user?.special_roles && user.special_roles.length > 0) ||
    (user?.capabilities && user.capabilities.length > 0);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Admin layout - show admin header/sidebar when browsing public pages
  if (isAuthenticated && hasAdminAccess) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex flex-1 flex-col pl-56">
          <AdminHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    );
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
