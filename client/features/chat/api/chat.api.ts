import { apiClient } from '@/shared/api/axios';

export const chatApi = {
  async getHistory(roomId: string) {
    const res = await apiClient.get(`/rooms/${roomId}/messages`);
    return res.data;
  }
};
