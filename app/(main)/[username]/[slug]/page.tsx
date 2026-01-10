'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { portfoliosApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { BlockRenderer } from '@/components/portfolio/block-renderer';
import { CommentSection } from '@/components/portfolio/comments/comment-section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Calendar, Edit, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { PortfolioActions } from '@/components/portfolio/portfolio-actions';

import { formatDate, formatDistanceToNow } from '@/lib/utils/format';
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
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const isOwner = currentUser?.username === username;

  // NOTE: removed useQueryClient here if not needed else where, but keep if useful.

  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio', username, slug],
    queryFn: () => portfoliosApi.getPortfolioBySlug(slug, username),
  });

  // Removed local mutation logic, now in PortfolioActions

  if (isLoading) {
    return <PortfolioSkeleton />;
  }

  if (error || !data?.data) {
    notFound();
  }

  const portfolio = data.data;

  return (
    <article className="pb-24 md:pb-16">
      {/* Hero Section - Full Width Thumbnail */}
      {portfolio.thumbnail_url ? (
        <div className="relative -mx-6 -mt-6 aspect-video w-[calc(100%+3rem)] overflow-hidden bg-muted md:aspect-[21/9]">
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
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-sm backdrop-blur-sm transition-colors hover:bg-background"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali</span>
          </button>

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
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
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
          <h1 className="mb-4 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
            {portfolio.judul}
          </h1>

          {/* Author & Meta Section - Moved Up */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* Author */}
            {portfolio.user && (
              <Link
                href={`/${portfolio.user.username}`}
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Avatar className="h-6 w-6 ring-1 ring-border">
                  <AvatarImage src={portfolio.user.avatar_url} alt={portfolio.user.nama} />
                  <AvatarFallback>{portfolio.user.nama?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{portfolio.user.nama}</span>
              </Link>
            )}

            <span className="text-muted-foreground/50">•</span>

            {/* Date */}
            <span className="flex items-center gap-1.5">
              {formatDate(portfolio.published_at || portfolio.created_at)}
            </span>

            {portfolio.updated_at && portfolio.updated_at !== portfolio.created_at && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="flex items-center gap-1.5" title={`Diperbarui ${formatDistanceToNow(portfolio.updated_at)}`}>
                  <Clock className="h-3.5 w-3.5" />
                  Updated
                </span>
              </>
            )}
          </div>

          {/* Tags */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {portfolio.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="font-normal">
                  {tag.nama}
                </Badge>
              ))}

              {/* Series Badge */}
              {portfolio.series && (
                <Badge className="bg-blue-500 font-normal text-white hover:bg-blue-600">
                  {portfolio.series.nama}
                </Badge>
              )}
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

        {/* Author Card (Bottom) */}
        {portfolio.user && (
          <div className="mt-16 rounded-xl border bg-card p-6">
            <div className="mb-4 text-sm font-medium text-muted-foreground">Tentang Penulis</div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href={`/${portfolio.user.username}`}>
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={portfolio.user.avatar_url} alt={portfolio.user.nama} />
                  <AvatarFallback className="text-xl">{portfolio.user.nama?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link href={`/${portfolio.user.username}`} className="hover:underline">
                  <h3 className="text-lg font-semibold">{portfolio.user.nama}</h3>
                </Link>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>@{portfolio.user.username}</span>
                  {portfolio.user.kelas_nama && <span>• {portfolio.user.kelas_nama}</span>}
                </div>
                {/* Bio or other info could go here */}
              </div>
              <Link href={`/${portfolio.user.username}`}>
                <Button variant="outline">Lihat Profil</Button>
              </Link>
            </div>
          </div>
        )}

        <Separator className="my-12" />

        {/* Comments Section */}
        <section id="comments">
          <CommentSection portfolioId={portfolio.id} />
        </section>
      </div>

      <PortfolioActions
        portfolio={{
          id: portfolio.id,
          judul: portfolio.judul,
          is_liked: portfolio.is_liked ?? false,
          like_count: portfolio.like_count ?? 0,
          username: portfolio.user?.username ?? '',
          slug: portfolio.slug
        }}
      />
    </article>
  );
}
