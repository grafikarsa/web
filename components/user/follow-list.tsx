'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { FollowUser } from '@/lib/types';
import { toast } from 'sonner';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface FollowListProps {
  username: string;
  type: 'followers' | 'following';
}

export function FollowList({ username, type }: FollowListProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [type, username, debouncedSearch],
    queryFn: () =>
      type === 'followers'
        ? usersApi.getFollowers(username, { search: debouncedSearch || undefined })
        : usersApi.getFollowing(username, { search: debouncedSearch || undefined }),
  });

  const users = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {users.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {search ? 'Tidak ditemukan' : type === 'followers' ? 'Belum ada followers' : 'Belum mengikuti siapapun'}
        </p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <FollowUserItem
              key={user.id}
              user={user}
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
              queryClient={queryClient}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FollowUserItem({
  user,
  currentUser,
  isAuthenticated,
  queryClient,
}: {
  user: FollowUser;
  currentUser: { username: string } | null;
  isAuthenticated: boolean;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const isCurrentUser = currentUser?.username === user.username;

  const followMutation = useMutation({
    mutationFn: () =>
      user.is_following ? usersApi.unfollow(user.username) : usersApi.follow(user.username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast.success(user.is_following ? 'Berhasil unfollow' : 'Berhasil follow');
    },
    onError: () => {
      toast.error('Gagal. Silakan coba lagi.');
    },
  });

  return (
    <div className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50">
      <Link href={`/${user.username}`}>
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar_url} alt={user.nama} />
          <AvatarFallback>{user.nama?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 overflow-hidden">
        <Link href={`/${user.username}`} className="hover:underline">
          <p className="truncate font-medium">{user.nama}</p>
        </Link>
        <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
        {user.kelas_nama && (
          <p className="truncate text-xs text-muted-foreground">{user.kelas_nama}</p>
        )}
      </div>
      {isAuthenticated && !isCurrentUser && (
        <Button
          variant={user.is_following ? 'outline' : 'default'}
          size="sm"
          onClick={() => followMutation.mutate()}
          disabled={followMutation.isPending}
        >
          {followMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {user.is_following ? 'Unfollow' : 'Follow'}
        </Button>
      )}
    </div>
  );
}
