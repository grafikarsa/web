'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usersApi } from '@/lib/api';
import { FollowList } from '@/components/user/follow-list';

export default function FollowingPage() {
  const params = useParams();
  const username = params.username as string;

  const { data, isLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => usersApi.getUserByUsername(username),
    enabled: !!username,
  });

  const profile = data?.data;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">User tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/${username}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Following</h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
      </div>
      <FollowList username={username} type="following" />
    </div>
  );
}
