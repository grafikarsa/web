import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCard as UserCardType } from '@/lib/types';

interface UserCardProps {
  user: UserCardType;
}

export function UserCard({ user }: UserCardProps) {
  const { username, nama, avatar_url, banner_url, role, kelas, jurusan, tahun_masuk, tahun_lulus } = user;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student':
        return 'Siswa';
      case 'alumni':
        return 'Alumni';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  return (
    <Link href={`/${username}`}>
      <div className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:-translate-y-1">
        {/* Banner */}
        <div className="relative h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
          {banner_url && (
            <Image
              src={banner_url}
              alt=""
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Avatar - overlapping banner */}
        <div className="relative px-4">
          <Avatar className="-mt-10 h-20 w-20 border-4 border-background shadow-md">
            <AvatarImage src={avatar_url || undefined} alt={nama} />
            <AvatarFallback className="text-xl font-semibold bg-primary/10">
              {getInitials(nama)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="p-4 pt-2">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {nama}
          </h3>
          <p className="text-sm text-muted-foreground truncate">@{username}</p>

          {/* Info */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-xs">
              {getRoleLabel(role)}
            </Badge>
            {role === 'student' && kelas && (
              <Badge variant="outline" className="text-xs">
                {kelas.nama}
              </Badge>
            )}
            {role === 'alumni' && tahun_masuk && tahun_lulus && (
              <Badge variant="outline" className="text-xs">
                {tahun_masuk}-{tahun_lulus}
              </Badge>
            )}
            {jurusan && (
              <Badge variant="outline" className="text-xs">
                {jurusan.kode || jurusan.nama}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
