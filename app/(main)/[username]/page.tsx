'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi, portfoliosApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { UserProfile } from '@/components/user/user-profile';
import { PortfolioCard } from '@/components/portfolio/portfolio-card';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';
import { use } from 'react';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-lg md:h-64" />
      <div className="px-4">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="mt-8 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params);
  const { user: currentUser } = useAuthStore();
  const isOwner = currentUser?.username === username;

  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', username],
    queryFn: () => usersApi.getUserByUsername(username),
  });

  const { data: portfoliosData, isLoading: portfoliosLoading } = useQuery({
    queryKey: ['user-portfolios', username, isOwner],
    queryFn: () =>
      isOwner
        ? portfoliosApi.getMyPortfolios({ limit: 50 })
        : portfoliosApi.getPortfolios({ user_id: userData?.data?.id, limit: 50 }),
    enabled: !!userData?.data,
  });

  if (userLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (userError || !userData?.data) {
    notFound();
  }

  const profile = userData.data;
  const portfolios = portfoliosData?.data || [];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <UserProfile profile={profile} />

      {/* Portfolios Section */}
      <div className="mt-12" id="portfolios">
        <h2 className="mb-6 text-xl font-semibold">
          Portofolio {isOwner && `(${portfolios.length})`}
        </h2>

        {portfoliosLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : portfolios.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Belum ada portofolio.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {portfolios.map((portfolio) => (
              <PortfolioCard key={portfolio.id} portfolio={portfolio} showStatus={isOwner} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
