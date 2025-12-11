import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PortfolioCard as PortfolioCardType } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';

interface PortfolioCardProps {
  portfolio: PortfolioCardType;
  showStatus?: boolean;
}

export function PortfolioCard({ portfolio, showStatus = false }: PortfolioCardProps) {
  const { judul, slug, thumbnail_url, published_at, created_at, user, tags, status } = portfolio;

  const firstTag = tags && tags.length > 0 ? tags[0] : null;
  const displayDate = published_at || created_at;

  return (
    <Card className="group gap-0 overflow-hidden border py-0 transition-shadow hover:shadow-lg">
      <Link href={`/${user?.username}/${slug}`} className="block p-3 pb-4">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
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

        {/* Tag Badge */}
        {firstTag && (
          <Badge variant="secondary" className="mt-3 rounded-full px-2.5 py-0.5 text-xs font-normal">
            {firstTag.nama}
          </Badge>
        )}

        {/* Title */}
        <h3 className="mt-2 line-clamp-2 font-semibold leading-tight group-hover:text-primary">
          {judul}
        </h3>

        {/* User Info & Date */}
        {user && (
          <div className="mt-3 flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url} alt={user.nama} />
              <AvatarFallback className="text-xs">{user.nama?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight">{user.nama}</span>
              <span className="text-xs text-muted-foreground">
                Posted on {formatDate(displayDate)}
              </span>
            </div>
          </div>
        )}
      </Link>
    </Card>
  );
}
