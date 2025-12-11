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
  jurusan_id: string;
  jurusan?: Major;
  created_at: string;
}

export interface AcademicYear {
  id: string;
  tahun: number;
  is_active: boolean;
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

  approvePortfolio: async (id: string) => {
    const response = await api.post<ApiResponse<Portfolio>>(`/admin/portfolios/${id}/approve`);
    return response.data;
  },

  rejectPortfolio: async (id: string, note: string) => {
    const response = await api.post<ApiResponse<Portfolio>>(`/admin/portfolios/${id}/reject`, { note });
    return response.data;
  },
};

// Admin Majors API
export const adminMajorsApi = {
  getMajors: async (params?: PaginationParams) => {
    const response = await api.get<ApiResponse<Major[]>>('/admin/majors', { params });
    return response.data;
  },

  createMajor: async (data: { nama: string; kode: string }) => {
    const response = await api.post<ApiResponse<Major>>('/admin/majors', data);
    return response.data;
  },

  updateMajor: async (id: string, data: { nama?: string; kode?: string }) => {
    const response = await api.patch<ApiResponse<Major>>(`/admin/majors/${id}`, data);
    return response.data;
  },

  deleteMajor: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/majors/${id}`);
    return response.data;
  },
};

// Admin Classes API
export const adminClassesApi = {
  getClasses: async (params?: PaginationParams & { jurusan_id?: string }) => {
    const response = await api.get<ApiResponse<Class[]>>('/admin/classes', { params });
    return response.data;
  },

  createClass: async (data: { nama: string; tingkat: number; jurusan_id: string }) => {
    const response = await api.post<ApiResponse<Class>>('/admin/classes', data);
    return response.data;
  },

  updateClass: async (id: string, data: { nama?: string; tingkat?: number; jurusan_id?: string }) => {
    const response = await api.patch<ApiResponse<Class>>(`/admin/classes/${id}`, data);
    return response.data;
  },

  deleteClass: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/classes/${id}`);
    return response.data;
  },
};

// Admin Academic Years API
export const adminAcademicYearsApi = {
  getAcademicYears: async (params?: PaginationParams) => {
    const response = await api.get<ApiResponse<AcademicYear[]>>('/admin/academic-years', { params });
    return response.data;
  },

  createAcademicYear: async (data: { tahun: number }) => {
    const response = await api.post<ApiResponse<AcademicYear>>('/admin/academic-years', data);
    return response.data;
  },

  updateAcademicYear: async (id: string, data: { tahun?: number; is_active?: boolean }) => {
    const response = await api.patch<ApiResponse<AcademicYear>>(`/admin/academic-years/${id}`, data);
    return response.data;
  },

  deleteAcademicYear: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/academic-years/${id}`);
    return response.data;
  },

  setActive: async (id: string) => {
    const response = await api.post<ApiResponse<AcademicYear>>(`/admin/academic-years/${id}/set-active`);
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
