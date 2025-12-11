import api from './client';
import { ApiResponse, PortfolioCard, PaginationParams } from '@/lib/types';

export const feedApi = {
  getFeed: async (params?: PaginationParams): Promise<ApiResponse<PortfolioCard[]>> => {
    const response = await api.get<ApiResponse<PortfolioCard[]>>('/feed', { params });
    return response.data;
  },
};
