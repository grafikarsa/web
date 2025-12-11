'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfoliosApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { BlockRenderer } from '@/components/portfolio/block-renderer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Share2, Calendar, Edit, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import { notFound } from 'next/navigation';

interface PortfolioDetailPageProps {
  params: Promise<{ username: string; slug: string }>;
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="h-10 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

export default function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const { username, slug } = use(params);
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const isOwner = currentUser?.username === username;

  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio', username, slug],
    queryFn: () => portfoliosApi.getPortfolioBySlug(slug, username),
  });

  const likeMutation = useMutation({
    mutationFn: () => {
      const portfolio = data?.data;
      if (!portfolio) throw new Error('Portfolio not found');
      return portfolio.is_liked
        ? portfoliosApi.unlikePortfolio(portfolio.id)
        : portfoliosApi.likePortfolio(portfolio.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', username, slug] });
    },
    onError: () => {
      toast.error('Gagal. Silakan coba lagi.');
    },
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: data?.data?.judul, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link berhasil disalin!');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <PortfolioSkeleton />
      </div>
    );
  }

  if (error || !data?.data) {
    notFound();
  }

  const portfolio = data.data;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back Button */}
      <Link href={`/${username}`} className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke profil
      </Link>

      {/* Thumbnail */}
      {portfolio.thumbnail_url && (
        <div className="relative mb-6 aspect-video overflow-hidden rounded-lg bg-muted">
          <Image src={portfolio.thumbnail_url} alt={portfolio.judul} fill className="object-cover" />
        </div>
      )}

      {/* Title & Status */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">{portfolio.judul}</h1>
        {isOwner && (
          <Link href={`/${username}/${slug}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {/* Status Badge (for owner) */}
      {isOwner && portfolio.status !== 'published' && (
        <Badge variant={portfolio.status === 'rejected' ? 'destructive' : 'secondary'} className="mb-4">
          {portfolio.status === 'pending_review' ? 'Menunggu Review' : portfolio.status}
        </Badge>
      )}

      {/* Admin Review Note */}
      {isOwner && portfolio.admin_review_note && (
        <div className="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
          <p className="text-sm font-medium">Catatan Admin:</p>
          <p className="text-sm text-muted-foreground">{portfolio.admin_review_note}</p>
        </div>
      )}

      {/* Tags */}
      {portfolio.tags && portfolio.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {portfolio.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">{tag.nama}</Badge>
          ))}
        </div>
      )}

      {/* User Info */}
      {portfolio.user && (
        <Link href={`/${portfolio.user.username}`} className="mb-6 flex items-center gap-3">
          <Avatar>
            <AvatarImage src={portfolio.user.avatar_url} alt={portfolio.user.nama} />
            <AvatarFallback>{portfolio.user.nama?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{portfolio.user.nama}</p>
            <p className="text-sm text-muted-foreground">
              @{portfolio.user.username} · {portfolio.user.kelas_nama}
            </p>
          </div>
        </Link>
      )}

      {/* Meta */}
      <div className="mb-8 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {formatDate(portfolio.published_at || portfolio.created_at)}
        </span>
      </div>

      {/* Content Blocks */}
      {portfolio.content_blocks && portfolio.content_blocks.length > 0 && (
        <div className="mb-8">
          <BlockRenderer blocks={portfolio.content_blocks} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 border-t pt-6">
        {isAuthenticated && (
          <Button
            variant={portfolio.is_liked ? 'default' : 'outline'}
            size="sm"
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
          >
            <Heart className={`mr-2 h-4 w-4 ${portfolio.is_liked ? 'fill-current' : ''}`} />
            {portfolio.like_count || 0}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
}
