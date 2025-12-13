// Feedback types

export type FeedbackKategori = 'bug' | 'saran' | 'lainnya';
export type FeedbackStatus = 'pending' | 'read' | 'resolved';

export interface Feedback {
  id: string;
  user_id?: string;
  user?: {
    id: string;
    username: string;
    nama: string;
    avatar_url?: string;
  };
  kategori: FeedbackKategori;
  pesan: string;
  status: FeedbackStatus;
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackRequest {
  kategori: FeedbackKategori;
  pesan: string;
}

export interface UpdateFeedbackRequest {
  status?: FeedbackStatus;
  admin_notes?: string;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  read: number;
  resolved: number;
}
