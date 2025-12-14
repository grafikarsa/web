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
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, Calendar, Edit, ArrowLeft, Eye, Clock, AlertCircle } from 'lucide-react';

import { formatDate, formatDistanceToNow } from '@/lib/utils/format';
import { toast } from 'sonner';
import { notFound } from 'next/navigation';

interface PortfolioDetailPageProps {
  params: Promise<{ username: string; slug: string }>;
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="aspect-[21/9] w-full" />
      <div className="mx-auto max-w-3xl space-y-6 px-4">
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-40 w-full" />
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
    return <PortfolioSkeleton />;
  }

  if (error || !data?.data) {
    notFound();
  }

  const portfolio = data.data;

  return (
    <article className="pb-16">
      {/* Hero Section - Full Width Thumbnail */}
      {portfolio.thumbnail_url ? (
        <div className="relative -mx-6 -mt-6 aspect-[21/9] w-[calc(100%+3rem)] overflow-hidden bg-muted">
          <Image 
            src={portfolio.thumbnail_url} 
            alt={portfolio.judul} 
            fill 
            className="object-cover" 
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          {/* Back Button on Thumbnail */}
          <Link 
            href={`/${username}`} 
            className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-sm backdrop-blur-sm transition-colors hover:bg-background"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>

          {/* Edit Button on Thumbnail */}
          {isOwner && (
            <Link 
              href={`/${username}/${slug}/edit`}
              className="absolute right-4 top-4"
            >
              <Button variant="secondary" size="sm" className="backdrop-blur-sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href={`/${username}`} 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke profil
          </Link>
          {isOwner && (
            <Link href={`/${username}/${slug}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Content Container */}
      <div className="mx-auto max-w-3xl px-4">
        {/* Title Section */}
        <header className={portfolio.thumbnail_url ? '-mt-16 relative z-10' : 'mt-4'}>
          {/* Status Badge (for owner) */}
          {isOwner && portfolio.status !== 'published' && (
            <Badge 
              variant={portfolio.status === 'rejected' ? 'destructive' : 'secondary'} 
              className="mb-3"
            >
              {portfolio.status === 'pending_review' ? 'Menunggu Review' : 
               portfolio.status === 'draft' ? 'Draft' : portfolio.status}
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
            {portfolio.judul}
          </h1>

          {/* Tags */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {portfolio.tags.map((tag) => (
                <Badge key={tag.id} variant="outline" className="font-normal">
                  {tag.nama}
                </Badge>
              ))}
            </div>
          )}

          {/* Series */}
          {portfolio.series && portfolio.series.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {portfolio.series.map((s) => (
                <Badge key={s.id} className="bg-blue-500 font-normal text-white hover:bg-blue-600">
                  {s.nama}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Admin Review Note */}
        {isOwner && portfolio.admin_review_note && (
          <div className="mt-6 flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Catatan dari Admin</p>
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-300">{portfolio.admin_review_note}</p>
            </div>
          </div>
        )}

        {/* Author & Meta Section */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Author */}
          {portfolio.user && (
            <Link 
              href={`/${portfolio.user.username}`} 
              className="group flex items-center gap-3"
            >
              <Avatar className="h-11 w-11 ring-2 ring-background">
                <AvatarImage src={portfolio.user.avatar_url} alt={portfolio.user.nama} />
                <AvatarFallback>{portfolio.user.nama?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium group-hover:underline">{portfolio.user.nama}</p>
                <p className="text-sm text-muted-foreground">
                  @{portfolio.user.username}
                  {portfolio.user.kelas_nama && ` · ${portfolio.user.kelas_nama}`}
                </p>
              </div>
            </Link>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(portfolio.published_at || portfolio.created_at)}
            </span>
            {portfolio.view_count !== undefined && (
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {portfolio.view_count} views
              </span>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Content Blocks */}
        {portfolio.content_blocks && portfolio.content_blocks.length > 0 ? (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <BlockRenderer blocks={portfolio.content_blocks} />
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>Belum ada konten</p>
          </div>
        )}

        <Separator className="my-8" />

        {/* Actions Footer */}
        <footer className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Like & Share */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant={portfolio.is_liked ? 'default' : 'outline'}
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
                className="gap-2"
              >
                <Heart className={`h-4 w-4 ${portfolio.is_liked ? 'fill-current' : ''}`} />
                <span>{portfolio.like_count || 0}</span>
                <span className="hidden sm:inline">Suka</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>{portfolio.like_count || 0} suka</span>
              </div>
            )}
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Bagikan</span>
            </Button>
          </div>

          {/* Timestamp */}
          {portfolio.updated_at && portfolio.updated_at !== portfolio.created_at && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Diperbarui {formatDistanceToNow(portfolio.updated_at)}
            </p>
          )}
        </footer>

        {/* Author Card */}
        {portfolio.user && (
          <div className="mt-12 rounded-xl border bg-card p-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <Link href={`/${portfolio.user.username}`}>
                <Avatar className="h-16 w-16">
                  <AvatarImage src={portfolio.user.avatar_url} alt={portfolio.user.nama} />
                  <AvatarFallback className="text-xl">{portfolio.user.nama?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link href={`/${portfolio.user.username}`} className="hover:underline">
                  <h3 className="text-lg font-semibold">{portfolio.user.nama}</h3>
                </Link>
                <p className="text-sm text-muted-foreground">@{portfolio.user.username}</p>
                {portfolio.user.kelas_nama && (
                  <p className="mt-1 text-sm text-muted-foreground">{portfolio.user.kelas_nama}</p>
                )}
              </div>
              <Link href={`/${portfolio.user.username}`}>
                <Button variant="outline">Lihat Profil</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
