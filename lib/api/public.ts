import api from './client';
import { ApiResponse } from '@/lib/types';

export interface JurusanPublic {
  id: string;
  nama: string;
  kode: string;
}

export interface KelasPublic {
  id: string;
  nama: string;
  tingkat: number;
  jurusan: {
    id: string;
    nama: string;
  };
}

interface KelasParams {
  jurusan_id?: string;
  tingkat?: number;
}

export const publicApi = {
  getJurusan: async (): Promise<ApiResponse<JurusanPublic[]>> => {
    const response = await api.get<ApiResponse<JurusanPublic[]>>('/jurusan');
    return response.data;
  },

  getKelas: async (params?: KelasParams): Promise<ApiResponse<KelasPublic[]>> => {
    const response = await api.get<ApiResponse<KelasPublic[]>>('/kelas', { params });
    return response.data;
  },
};
