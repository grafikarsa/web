import api from './client';
import { ApiResponse, Series } from '@/lib/types';

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

import { SeriesDetail } from '@/lib/types';

export const seriesApi = {
  getSeries: async (): Promise<ApiResponse<Series[]>> => {
    const response = await api.get<ApiResponse<Series[]>>('/series');
    return response.data;
  },

  getSeriesById: async (id: string): Promise<ApiResponse<SeriesDetail>> => {
    const response = await api.get<ApiResponse<SeriesDetail>>(`/series/${id}`);
    return response.data;
  },
};
