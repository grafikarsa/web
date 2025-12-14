import { User, UserCard } from './user';

export type PortfolioStatus = 'draft' | 'pending_review' | 'rejected' | 'published' | 'archived';
export type ContentBlockType = 'text' | 'image' | 'table' | 'youtube' | 'button' | 'embed';

export interface Tag {
  id: string;
  nama: string;
}

export interface SeriesBlock {
  id: string;
  block_type: ContentBlockType;
  block_order: number;
  instruksi: string;
}

export interface Series {
  id: string;
  nama: string;
  deskripsi?: string;
  is_active: boolean;
  block_count?: number;
  portfolio_count?: number;
  blocks?: SeriesBlock[];
  created_at: string;
}

export interface SeriesDetail extends Series {
  blocks: SeriesBlock[];
}

export interface ContentBlock {
  id: string;
  block_type: ContentBlockType;
  block_order: number;
  payload: ContentBlockPayload;
  created_at?: string;
  updated_at?: string;
}

export type ContentBlockPayload =
  | TextBlockPayload
  | ImageBlockPayload
  | TableBlockPayload
  | YoutubeBlockPayload
  | ButtonBlockPayload
  | EmbedBlockPayload;

export interface TextBlockPayload {
  content: string;
}

export interface ImageBlockPayload {
  url: string;
  caption?: string;
}

export interface TableBlockPayload {
  headers: string[];
  rows: string[][];
}

export interface YoutubeBlockPayload {
  video_id: string;
  title?: string;
}

export interface ButtonBlockPayload {
  text: string;
  url: string;
}

export interface EmbedBlockPayload {
  html: string;
  title?: string;
}

export interface PortfolioSeries {
  id: string;
  nama: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  judul: string;
  slug: string;
  thumbnail_url?: string;
  status: PortfolioStatus;
  admin_review_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  like_count?: number;
  is_liked?: boolean;
  user?: UserCard & { kelas_nama?: string };
  tags?: Tag[];
  series?: PortfolioSeries | null;
  content_blocks?: ContentBlock[];
}

export interface PortfolioCard {
  id: string;
  judul: string;
  slug: string;
  thumbnail_url?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  status?: PortfolioStatus;
  like_count?: number;
  user?: UserCard & { kelas_nama?: string };
  tags?: Tag[];
  series?: PortfolioSeries | null;
  admin_review_note?: string;
}
