'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, SocialLink, SocialPlatform } from '@/lib/types';
import { profileApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useDebounce } from '@/lib/hooks/use-debounce';

const profileSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  username: z.string().min(3, 'Username minimal 3 karakter').max(30).regex(/^[a-z0-9_]+$/, 'Username hanya boleh huruf kecil, angka, dan underscore'),
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional(),
  email: z.string().email('Email tidak valid').optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Password saat ini wajib diisi'),
  new_password: z.string().min(8, 'Password minimal 8 karakter'),
  new_password_confirmation: z.string(),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['new_password_confirmation'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const socialPlatforms: { value: SocialPlatform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'behance', label: 'Behance' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'threads', label: 'Threads' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'medium', label: 'Medium' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'personal_website', label: 'Website' },
];

interface UserEditFormProps {
  user: User;
}

export function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(user.social_links || []);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nama: user.nama,
      username: user.username,
      bio: user.bio || '',
      email: user.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  const watchedUsername = profileForm.watch('username');
  const debouncedUsername = useDebounce(watchedUsername, 500);


  // Check username availability
  const checkUsername = async (username: string) => {
    if (username === user.username) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const response = await profileApi.checkUsername(username);
      setUsernameAvailable(response.data?.available ?? false);
    } catch {
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Effect for username check
  useState(() => {
    if (debouncedUsername && debouncedUsername !== user.username) {
      checkUsername(debouncedUsername);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => profileApi.updateMe(data),
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data);
        queryClient.invalidateQueries({ queryKey: ['user', user.username] });
        toast.success('Profil berhasil diperbarui');
        if (response.data.username !== user.username) {
          router.push(`/${response.data.username}`);
        }
      }
    },
    onError: () => {
      toast.error('Gagal memperbarui profil');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => profileApi.updatePassword(data),
    onSuccess: () => {
      toast.success('Password berhasil diperbarui');
      passwordForm.reset();
    },
    onError: () => {
      toast.error('Gagal memperbarui password');
    },
  });

  const updateSocialLinksMutation = useMutation({
    mutationFn: (links: SocialLink[]) => profileApi.updateSocialLinks(links),
    onSuccess: (response) => {
      if (response.data) {
        setSocialLinks(response.data.social_links);
        queryClient.invalidateQueries({ queryKey: ['user', user.username] });
        toast.success('Social links berhasil diperbarui');
      }
    },
    onError: () => {
      toast.error('Gagal memperbarui social links');
    },
  });

  const handleSocialLinkChange = (platform: SocialPlatform, url: string) => {
    setSocialLinks((prev) => {
      const existing = prev.find((l) => l.platform === platform);
      if (existing) {
        if (!url) {
          return prev.filter((l) => l.platform !== platform);
        }
        return prev.map((l) => (l.platform === platform ? { ...l, url } : l));
      }
      if (url) {
        return [...prev, { platform, url }];
      }
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>Perbarui informasi dasar profil Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input id="nama" {...profileForm.register('nama')} />
                {profileForm.formState.errors.nama && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.nama.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input id="username" {...profileForm.register('username')} />
                  {checkingUsername && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <X className="absolute right-3 top-2.5 h-4 w-4 text-destructive" />
                  )}
                </div>
                {profileForm.formState.errors.username && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.username.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...profileForm.register('email')} />
              {profileForm.formState.errors.email && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={4} {...profileForm.register('bio')} placeholder="Ceritakan tentang dirimu..." />
              {profileForm.formState.errors.bio && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.bio.message}</p>
              )}
            </div>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Tambahkan link ke profil sosial media Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {socialPlatforms.map((platform) => (
              <div key={platform.value} className="space-y-2">
                <Label htmlFor={platform.value}>{platform.label}</Label>
                <Input
                  id={platform.value}
                  type="url"
                  placeholder={`https://${platform.value}.com/...`}
                  value={socialLinks.find((l) => l.platform === platform.value)?.url || ''}
                  onChange={(e) => handleSocialLinkChange(platform.value, e.target.value)}
                />
              </div>
            ))}
          </div>
          <Button
            className="mt-4"
            onClick={() => updateSocialLinksMutation.mutate(socialLinks)}
            disabled={updateSocialLinksMutation.isPending}
          >
            {updateSocialLinksMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Social Links
          </Button>
        </CardContent>
      </Card>

      {/* Password Form */}
      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>Pastikan password baru Anda kuat dan mudah diingat</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit((data) => updatePasswordMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Password Saat Ini</Label>
              <Input id="current_password" type="password" {...passwordForm.register('current_password')} />
              {passwordForm.formState.errors.current_password && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.current_password.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new_password">Password Baru</Label>
                <Input id="new_password" type="password" {...passwordForm.register('new_password')} />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.new_password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password_confirmation">Konfirmasi Password</Label>
                <Input id="new_password_confirmation" type="password" {...passwordForm.register('new_password_confirmation')} />
                {passwordForm.formState.errors.new_password_confirmation && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.new_password_confirmation.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={updatePasswordMutation.isPending}>
              {updatePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ubah Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
