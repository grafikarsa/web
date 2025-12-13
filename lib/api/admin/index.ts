import api from '../client';
import { ApiResponse, User, UserCard, Portfolio, PortfolioCard, Tag, PaginationParams } from '@/lib/types';

// Types for admin
export interface Major {
  id: string;
  nama: string;
  kode: string;
  created_at: string;
}

export interface Class {
  id: string;
  nama: string;
  tingkat: number;
  rombel: string;
  jurusan_id: string;
  tahun_ajaran_id: string;
  jurusan?: Major;
  tahun_ajaran?: AcademicYear;
  student_count?: number;
  created_at: string;
}

export interface AcademicYear {
  id: string;
  tahun_mulai: number;
  is_active: boolean;
  promotion_month: number;
  promotion_day: number;
  created_at: string;
}

// Admin Users API
export const adminUsersApi = {
  getUsers: async (params?: PaginationParams & { search?: string; role?: string; is_active?: boolean; kelas_id?: string; jurusan_id?: string }) => {
    const response = await api.get<ApiResponse<User[]>>('/admin/users', { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (data: Partial<User> & { password: string }) => {
    const response = await api.post<ApiResponse<User>>('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await api.patch<ApiResponse<User>>(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/users/${id}`);
    return response.data;
  },

  toggleActive: async (id: string, currentlyActive: boolean) => {
    const endpoint = currentlyActive ? 'deactivate' : 'activate';
    const response = await api.post<ApiResponse<User>>(`/admin/users/${id}/${endpoint}`);
    return response.data;
  },

  activate: async (id: string) => {
    const response = await api.post<ApiResponse<null>>(`/admin/users/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: string) => {
    const response = await api.post<ApiResponse<null>>(`/admin/users/${id}/deactivate`);
    return response.data;
  },

  resetPassword: async (id: string, newPassword: string) => {
    const response = await api.patch<ApiResponse<null>>(`/admin/users/${id}/password`, { new_password: newPassword });
    return response.data;
  },

  checkUsername: async (username: string, excludeId?: string) => {
    const params: Record<string, string> = { username };
    if (excludeId) params.exclude_id = excludeId;
    const response = await api.get<ApiResponse<{ username: string; available: boolean }>>('/admin/users/check-username', { params });
    return response.data;
  },

  checkEmail: async (email: string, excludeId?: string) => {
    const params: Record<string, string> = { email };
    if (excludeId) params.exclude_id = excludeId;
    const response = await api.get<ApiResponse<{ email: string; available: boolean }>>('/admin/users/check-email', { params });
    return response.data;
  },
};

// Admin Portfolios API
export const adminPortfoliosApi = {
  getPortfolios: async (params?: PaginationParams & { search?: string; status?: string }) => {
    const response = await api.get<ApiResponse<PortfolioCard[]>>('/admin/portfolios', { params });
    return response.data;
  },

  getPortfolio: async (id: string) => {
    const response = await api.get<ApiResponse<Portfolio>>(`/admin/portfolios/${id}`);
    return response.data;
  },

  createPortfolio: async (data: { judul: string; user_id: string; tag_ids?: string[] }) => {
    const response = await api.post<ApiResponse<Portfolio>>('/portfolios', data);
    return response.data;
  },

  updatePortfolio: async (id: string, data: Partial<Portfolio> & { tag_ids?: string[] }) => {
    const response = await api.patch<ApiResponse<Portfolio>>(`/admin/portfolios/${id}`, data);
    return response.data;
  },

  deletePortfolio: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/portfolios/${id}`);
    return response.data;
  },

  approvePortfolio: async (id: string, note?: string) => {
    const response = await api.post<ApiResponse<Portfolio>>(`/admin/portfolios/${id}/approve`, note ? { note } : undefined);
    return response.data;
  },

  rejectPortfolio: async (id: string, note: string) => {
    const response = await api.post<ApiResponse<Portfolio>>(`/admin/portfolios/${id}/reject`, { note });
    return response.data;
  },

  // Content Blocks
  addBlock: async (portfolioId: string, block: { block_type: string; block_order: number; payload: Record<string, unknown> }) => {
    const response = await api.post<ApiResponse<{ id: string }>>(`/portfolios/${portfolioId}/blocks`, block);
    return response.data;
  },

  updateBlock: async (portfolioId: string, blockId: string, data: { payload?: Record<string, unknown> }) => {
    const response = await api.patch<ApiResponse<{ id: string }>>(`/portfolios/${portfolioId}/blocks/${blockId}`, data);
    return response.data;
  },

  reorderBlocks: async (portfolioId: string, block_orders: Array<{ id: string; order: number }>) => {
    const response = await api.put<ApiResponse<null>>(`/portfolios/${portfolioId}/blocks/reorder`, { block_orders });
    return response.data;
  },

  deleteBlock: async (portfolioId: string, blockId: string) => {
    const response = await api.delete<ApiResponse<null>>(`/portfolios/${portfolioId}/blocks/${blockId}`);
    return response.data;
  },
};

// Upload API
export interface PresignResponse {
  upload_id: string;
  presigned_url: string;
  object_key: string;
  expires_in: number;
  method: string;
  headers: Record<string, string>;
}

export interface ConfirmUploadResponse {
  type: string;
  url: string;
  object_key: string;
  portfolio_id?: string;
  block_id?: string;
}

export const uploadsApi = {
  presign: async (data: {
    upload_type: 'avatar' | 'banner' | 'thumbnail' | 'portfolio_image';
    filename: string;
    content_type: string;
    file_size: number;
    portfolio_id?: string;
    block_id?: string;
  }) => {
    const response = await api.post<ApiResponse<PresignResponse>>('/uploads/presign', data);
    return response.data;
  },

  confirm: async (data: { upload_id: string; object_key: string }) => {
    const response = await api.post<ApiResponse<ConfirmUploadResponse>>('/uploads/confirm', data);
    return response.data;
  },

  uploadFile: async (
    file: File,
    uploadType: 'avatar' | 'banner' | 'thumbnail' | 'portfolio_image',
    portfolioId?: string,
    blockId?: string
  ): Promise<string> => {
    // 1. Get presigned URL
    const presignRes = await uploadsApi.presign({
      upload_type: uploadType,
      filename: file.name,
      content_type: file.type,
      file_size: file.size,
      portfolio_id: portfolioId,
      block_id: blockId,
    });

    if (!presignRes.data) throw new Error('Failed to get presigned URL');

    const { upload_id, presigned_url, object_key, headers } = presignRes.data;

    // 2. Upload to MinIO (try direct first, fallback to proxy)
    let uploadRes: Response;
    try {
      uploadRes = await fetch(presigned_url, {
        method: 'PUT',
        headers: headers,
        body: file,
        mode: 'cors',
      });
      if (!uploadRes.ok) {
        throw new Error('Direct upload failed');
      }
    } catch {
      // CORS error or direct upload failed - fallback to proxy
      console.log('Direct upload failed, using proxy...');
      uploadRes = await fetch('/api/upload-proxy', {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'x-presigned-url': presigned_url,
        },
        body: file,
      });
    }

    if (!uploadRes.ok) {
      const errorData = await uploadRes.text();
      console.error('Upload failed:', uploadRes.status, errorData);
      throw new Error(`Upload to storage failed: ${errorData}`);
    }

    // 3. Confirm upload
    const confirmRes = await uploadsApi.confirm({ upload_id, object_key });

    if (!confirmRes.data) throw new Error('Failed to confirm upload');

    return confirmRes.data.url;
  },
};

// Admin Majors API (Jurusan)
export const adminMajorsApi = {
  getMajors: async (params?: PaginationParams) => {
    const response = await api.get<ApiResponse<Major[]>>('/admin/jurusan', { params });
    return response.data;
  },

  createMajor: async (data: { nama: string; kode: string }) => {
    const response = await api.post<ApiResponse<Major>>('/admin/jurusan', data);
    return response.data;
  },

  updateMajor: async (id: string, data: { nama?: string; kode?: string }) => {
    const response = await api.patch<ApiResponse<Major>>(`/admin/jurusan/${id}`, data);
    return response.data;
  },

  deleteMajor: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/jurusan/${id}`);
    return response.data;
  },
};

// Admin Classes API (Kelas)
export const adminClassesApi = {
  getClasses: async (params?: PaginationParams & { jurusan_id?: string; tahun_ajaran_id?: string; tingkat?: number }) => {
    const response = await api.get<ApiResponse<Class[]>>('/admin/kelas', { params });
    return response.data;
  },

  createClass: async (data: { tingkat: number; rombel: string; jurusan_id: string; tahun_ajaran_id: string }) => {
    const response = await api.post<ApiResponse<Class>>('/admin/kelas', data);
    return response.data;
  },

  updateClass: async (id: string, data: { tingkat?: number; rombel?: string; jurusan_id?: string }) => {
    const response = await api.patch<ApiResponse<Class>>(`/admin/kelas/${id}`, data);
    return response.data;
  },

  deleteClass: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/kelas/${id}`);
    return response.data;
  },
};

// Admin Academic Years API
export const adminAcademicYearsApi = {
  getAcademicYears: async (params?: PaginationParams) => {
    const response = await api.get<ApiResponse<AcademicYear[]>>('/admin/tahun-ajaran', { params });
    return response.data;
  },

  createAcademicYear: async (data: { tahun_mulai: number; promotion_month?: number; promotion_day?: number }) => {
    const response = await api.post<ApiResponse<AcademicYear>>('/admin/tahun-ajaran', data);
    return response.data;
  },

  updateAcademicYear: async (id: string, data: { tahun_mulai?: number; is_active?: boolean; promotion_month?: number; promotion_day?: number }) => {
    const response = await api.patch<ApiResponse<AcademicYear>>(`/admin/tahun-ajaran/${id}`, data);
    return response.data;
  },

  deleteAcademicYear: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/tahun-ajaran/${id}`);
    return response.data;
  },

  setActive: async (id: string) => {
    const response = await api.post<ApiResponse<AcademicYear>>(`/admin/tahun-ajaran/${id}/set-active`);
    return response.data;
  },
};

// Admin Tags API
export const adminTagsApi = {
  getTags: async (params?: PaginationParams & { search?: string }) => {
    const response = await api.get<ApiResponse<Tag[]>>('/admin/tags', { params });
    return response.data;
  },

  createTag: async (data: { nama: string }) => {
    const response = await api.post<ApiResponse<Tag>>('/admin/tags', data);
    return response.data;
  },

  updateTag: async (id: string, data: { nama: string }) => {
    const response = await api.patch<ApiResponse<Tag>>(`/admin/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/tags/${id}`);
    return response.data;
  },
};
