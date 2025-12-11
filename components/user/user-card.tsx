import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { UserCard as UserCardType } from '@/lib/types';

interface UserCardProps {
  user: UserCardType;
}

export function UserCard({ user }: UserCardProps) {
  const { username, nama, avatar_url, role, kelas, jurusan, tahun_masuk, tahun_lulus } = user;

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
      <div className="group rounded-3xl border bg-card p-4 transition-all hover:shadow-lg">
        {/* Avatar Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
          {avatar_url ? (
            <Image
              src={avatar_url}
              alt={nama}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-4xl font-bold text-primary/60">{getInitials(nama)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-bold text-foreground">{nama}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">@{username}</p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="secondary" className="rounded-full text-xs">
              {getRoleLabel(role)}
            </Badge>
            {role === 'student' && kelas && (
              <Badge variant="outline" className="rounded-full text-xs">
                {kelas.nama}
              </Badge>
            )}
            {role === 'alumni' && tahun_masuk && tahun_lulus && (
              <Badge variant="outline" className="rounded-full text-xs">
                {tahun_masuk} - {tahun_lulus}
              </Badge>
            )}
            {jurusan && (
              <Badge variant="outline" className="rounded-full text-xs">
                {jurusan.kode || jurusan.nama}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
