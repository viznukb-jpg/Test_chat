import { apiClient } from '@/shared/api/axios';

export const roomsApi = {
  async getMyRooms() {
    const res = await apiClient.get('/rooms');
    return res.data;
  },
  async createRoom(title: string) {
    const res = await apiClient.post('/rooms', { title });
    return res.data;
  },
  async joinRoom(joinCode: string) {
    const res = await apiClient.post('/rooms/join', { joinCode });
    return res.data;
  },
  async getMembers(roomId: string) {
    const res = await apiClient.get(`/rooms/${roomId}/members`);
    return res.data;
  },
  async kickUser(roomId: string, targetUserId: string) {
    const res = await apiClient.delete(`/rooms/${roomId}/members/${targetUserId}`);
    return res.data;
  },
  async muteUser(roomId: string, targetUserId: string, durationMins: number) {
    const res = await apiClient.patch(`/rooms/${roomId}/members/${targetUserId}/mute`, { durationMins });
    return res.data;
  },
  async unmuteUser(roomId: string, targetUserId: string) {
    const res = await apiClient.patch(`/rooms/${roomId}/members/${targetUserId}/unmute`);
    return res.data;
  },
  async deleteRoom(roomId: string) {
    const res = await apiClient.delete(`/rooms/${roomId}`);
    return res.data;
  },
  async leaveRoom(roomId: string) {
    const res = await apiClient.delete(`/rooms/${roomId}/leave`);
    return res.data;
  }
};
