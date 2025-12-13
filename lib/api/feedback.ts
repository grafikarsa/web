import api from './client';
import { ApiResponse, Feedback, CreateFeedbackRequest } from '@/lib/types';

export const feedbackApi = {
  // Create feedback (public, auth optional)
  create: async (data: CreateFeedbackRequest): Promise<ApiResponse<Feedback>> => {
    const response = await api.post<ApiResponse<Feedback>>('/feedback', data);
    return response.data;
  },
};
