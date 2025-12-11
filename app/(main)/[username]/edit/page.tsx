'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { usersApi } from '@/lib/api';
import { UserEditForm } from '@/components/user/user-edit-form';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => usersApi.getUserByUsername(username),
    enabled: !!username,
  });

  const profile = data?.data;
  const isOwner = currentUser?.username === username;

  // Redirect if not owner
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isOwner) {
      router.push(`/${username}`);
    }
  }, [authLoading, isAuthenticated, isOwner, username, router]);

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile || !isOwner) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/${username}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Profil</h1>
      </div>
      <UserEditForm user={profile} />
    </div>
  );
}
