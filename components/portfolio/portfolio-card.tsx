import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar } from 'lucide-react';
import { PortfolioCard as PortfolioCardType } from '@/lib/types';
import { formatDistanceToNow } from '@/lib/utils/format';

interface PortfolioCardProps {
  portfolio: PortfolioCardType;
  showStatus?: boolean;
}

export function PortfolioCard({ portfolio, showStatus = false }: PortfolioCardProps) {
  const { judul, slug, thumbnail_url, published_at, created_at, like_count, user, tags, status } = portfolio;

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/${user?.username}/${slug}`}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {thumbnail_url ? (
            <Image
              src={thumbnail_url}
              alt={judul}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {showStatus && status && status !== 'published' && (
            <Badge
              variant={status === 'pending_review' ? 'secondary' : status === 'rejected' ? 'destructive' : 'outline'}
              className="absolute right-2 top-2"
            >
              {status === 'pending_review' ? 'Pending' : status === 'rejected' ? 'Ditolak' : status}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="mb-2 line-clamp-2 font-semibold group-hover:text-primary">{judul}</h3>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.nama}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar_url} alt={user.nama} />
                <AvatarFallback className="text-xs">{user.nama?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{user.nama}</span>
            </div>
          )}

          {/* Meta */}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(published_at || created_at)}
            </div>
            {typeof like_count === 'number' && (
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {like_count}
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
