'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { portfoliosApi } from '@/lib/api';
import { PortfolioForm } from '@/components/portfolio/portfolio-form';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  pending_review: { label: 'Menunggu Review', variant: 'outline' },
  published: { label: 'Published', variant: 'default' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
  archived: { label: 'Diarsipkan', variant: 'secondary' },
};

export default function EditPortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const slug = params.slug as string;
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['portfolio', slug, username],
    queryFn: () => portfoliosApi.getPortfolioBySlug(slug, username),
    enabled: !!slug && !!username,
  });

  const portfolio = data?.data;
  const isOwner = currentUser?.username === username;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isOwner) {
      router.push(`/${username}/${slug}`);
    }
  }, [authLoading, isAuthenticated, isOwner, username, slug, router]);

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!portfolio || !isOwner) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Portfolio tidak ditemukan</p>
      </div>
    );
  }

  const status = statusLabels[portfolio.status] || { label: portfolio.status, variant: 'outline' as const };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${username}/${slug}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Portfolio</h1>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <PortfolioForm portfolio={portfolio} isEdit />
    </div>
  );
}
