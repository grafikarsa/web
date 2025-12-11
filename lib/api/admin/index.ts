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
  getUsers: async (params?: PaginationParams & { search?: string; role?: string }) => {
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

  toggleActive: async (id: string) => {
    const response = await api.post<ApiResponse<User>>(`/admin/users/${id}/toggle-active`);
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

  updatePortfolio: async (id: string, data: Partial<Portfolio>) => {
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
