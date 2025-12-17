'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, generateBgColor } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  Youtube,
  Facebook,
  Loader2,
  Edit,
} from 'lucide-react';
import { FollowModal } from './follow-modal';

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  personal_website: Globe,
  youtube: Youtube,
  facebook: Facebook,
};

interface UserProfileProps {
  profile: User;
}

export function UserProfile({ profile }: UserProfileProps) {
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const isOwner = currentUser?.username === profile.username;
  const isAdmin = currentUser?.role === 'admin';
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);

  const followMutation = useMutation({
    mutationFn: () =>
      profile.is_following
        ? usersApi.unfollow(profile.username)
        : usersApi.follow(profile.username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', profile.username] });
      toast.success(profile.is_following ? 'Berhasil unfollow' : 'Berhasil follow');
    },
    onError: () => {
      toast.error('Gagal. Silakan coba lagi.');
    },
  });

  return (
    <div>
      {/* Banner - Full width, edge-to-edge */}
      <div className="-mx-6 -mt-6 relative h-48 w-[calc(100%+3rem)] bg-gradient-to-r from-primary/20 to-primary/10 md:h-56">
        {profile.banner_url && (
          <Image src={profile.banner_url} alt="Banner" fill className="object-cover" />
        )}
      </div>

      {/* Profile Content */}
      <div className="container mx-auto max-w-5xl px-6 md:px-12 lg:px-16">
        {/* Avatar & Actions Row */}
        <div className="relative flex items-end justify-between">
          {/* Avatar - overlapping banner */}
          <Avatar className="-mt-16 h-28 w-28 border-4 border-background md:h-32 md:w-32">
            <AvatarImage src={profile.avatar_url} alt={profile.nama} />
            <AvatarFallback className="text-3xl md:text-4xl">
              {profile.nama?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Actions */}
          <div className="flex gap-2 pb-2">
            {isOwner ? (
              <Link href={`/${profile.username}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profil
                </Button>
              </Link>
            ) : isAuthenticated && !isAdmin ? (
              <Button
                variant={profile.is_following ? 'outline' : 'default'}
                size="sm"
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
              >
                {followMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {profile.is_following ? 'Unfollow' : 'Follow'}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Name & Username */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold md:text-3xl">{profile.nama}</h1>
            {/* Special Role Badges */}
            {profile.special_roles && profile.special_roles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {profile.special_roles.map((sr) => (
                  <Badge
                    key={sr.id}
                    className="text-xs font-medium"
                    style={{
                      backgroundColor: generateBgColor(sr.color),
                      color: sr.color,
                      borderColor: generateBgColor(sr.color, 0.3),
                    }}
                    variant="outline"
                  >
                    {sr.nama}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && <p className="mt-3 max-w-2xl text-muted-foreground">{profile.bio}</p>}

        {/* Info Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">
            {profile.role}
          </Badge>
          {profile.kelas && <Badge variant="secondary">{profile.kelas.nama}</Badge>}
          {profile.jurusan && <Badge variant="secondary">{profile.jurusan.nama}</Badge>}
          {profile.tahun_masuk && (
            <Badge variant="outline">
              {profile.tahun_masuk} - {profile.tahun_lulus || 'Sekarang'}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="mt-5 flex gap-6 text-sm">
          <button
            onClick={() => setFollowModalType('followers')}
            className="hover:underline"
          >
            <span className="font-semibold">{profile.follower_count || 0}</span>{' '}
            <span className="text-muted-foreground">Followers</span>
          </button>
          <button
            onClick={() => setFollowModalType('following')}
            className="hover:underline"
          >
            <span className="font-semibold">{profile.following_count || 0}</span>{' '}
            <span className="text-muted-foreground">Following</span>
          </button>
          <span>
            <span className="font-semibold">{profile.portfolio_count || 0}</span>{' '}
            <span className="text-muted-foreground">Portofolio</span>
          </span>
        </div>

        {/* Follow Modal */}
        <FollowModal
          username={profile.username}
          type={followModalType || 'followers'}
          open={followModalType !== null}
          onOpenChange={(open) => !open && setFollowModalType(null)}
        />

        {/* Social Links */}
        {profile.social_links && profile.social_links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {profile.social_links.map((link) => {
              const Icon = socialIcons[link.platform] || Globe;
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title={link.platform}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        )}

        {/* Divider */}
        <div className="mb-8 mt-8 border-t" />
      </div>
    </div>
  );
}
