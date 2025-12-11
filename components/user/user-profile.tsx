'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, SocialLink } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Github, Instagram, Linkedin, Twitter, Globe, Youtube,
  Facebook, Loader2, Edit, Users
} from 'lucide-react';

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
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative h-48 overflow-hidden rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 md:h-64">
        {profile.banner_url && (
          <Image src={profile.banner_url} alt="Banner" fill className="object-cover" />
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-4">
        {/* Avatar */}
        <Avatar className="absolute -top-16 h-32 w-32 border-4 border-background">
          <AvatarImage src={profile.avatar_url} alt={profile.nama} />
          <AvatarFallback className="text-4xl">{profile.nama?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          {isOwner ? (
            <Link href={`/${profile.username}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profil
              </Button>
            </Link>
          ) : isAuthenticated ? (
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

        {/* Name & Username */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold">{profile.nama}</h1>
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}

        {/* Info Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">{profile.role}</Badge>
          {profile.kelas && <Badge variant="secondary">{profile.kelas.nama}</Badge>}
          {profile.jurusan && <Badge variant="secondary">{profile.jurusan.nama}</Badge>}
          {profile.tahun_masuk && (
            <Badge variant="outline">
              {profile.tahun_masuk} - {profile.tahun_lulus || 'Sekarang'}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-6 text-sm">
          <Link href={`/${profile.username}/followers`} className="hover:underline">
            <span className="font-semibold">{profile.follower_count || 0}</span>{' '}
            <span className="text-muted-foreground">Followers</span>
          </Link>
          <Link href={`/${profile.username}/following`} className="hover:underline">
            <span className="font-semibold">{profile.following_count || 0}</span>{' '}
            <span className="text-muted-foreground">Following</span>
          </Link>
          <span>
            <span className="font-semibold">{profile.portfolio_count || 0}</span>{' '}
            <span className="text-muted-foreground">Portofolio</span>
          </span>
        </div>

        {/* Social Links */}
        {profile.social_links && profile.social_links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.social_links.map((link) => {
              const Icon = socialIcons[link.platform] || Globe;
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2 hover:bg-muted"
                  title={link.platform}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
