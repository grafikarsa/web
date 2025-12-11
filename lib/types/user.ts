export type UserRole = 'student' | 'alumni' | 'admin';

export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'github'
  | 'linkedin'
  | 'twitter'
  | 'personal_website'
  | 'tiktok'
  | 'youtube'
  | 'behance'
  | 'dribbble'
  | 'threads'
  | 'bluesky'
  | 'medium'
  | 'gitlab';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface Kelas {
  id: string;
  nama: string;
  tingkat?: number;
}

export interface Jurusan {
  id: string;
  nama: string;
  kode?: string;
}

export interface ClassHistory {
  kelas_nama: string;
  tahun_ajaran: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  nama: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  role: UserRole;
  nisn?: string;
  nis?: string;
  tahun_masuk?: number;
  tahun_lulus?: number;
  kelas?: Kelas;
  jurusan?: Jurusan;
  class_history?: ClassHistory[];
  social_links?: SocialLink[];
  follower_count?: number;
  following_count?: number;
  portfolio_count?: number;
  is_following?: boolean;
  is_active?: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserCard {
  id: string;
  username: string;
  nama: string;
  avatar_url?: string;
  role: UserRole;
  kelas?: Kelas;
  jurusan?: Jurusan;
}

export interface FollowUser extends UserCard {
  kelas_nama?: string;
  is_following?: boolean;
  followed_at?: string;
}
