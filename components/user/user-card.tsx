import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserCard as UserCardType } from '@/lib/types';

interface UserCardProps {
  user: UserCardType;
}

export function UserCard({ user }: UserCardProps) {
  const { username, nama, avatar_url, role, kelas, jurusan } = user;

  return (
    <Link href={`/${username}`}>
      <Card className="transition-shadow hover:shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={avatar_url} alt={nama} />
              <AvatarFallback className="text-lg">{nama?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <h3 className="truncate font-semibold">{nama}</h3>
              <p className="truncate text-sm text-muted-foreground">@{username}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {kelas && (
                  <Badge variant="secondary" className="text-xs">
                    {kelas.nama}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {role}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
