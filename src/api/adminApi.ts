import { axiosClient } from './axiosClient';
import type { ManagerInvitationDto, ManagerRequestDto } from '../types/auth.types';

export const adminApi = {
  getPendingManagerRequests: async () => {
    const { data } = await axiosClient.get<ManagerRequestDto[]>('/admin/manager-requests');
    return data;
  },

  approveManagerRequest: async (userId: string) => {
    const { data } = await axiosClient.post<{ message: string }>(`/admin/manager-requests/${userId}/approve`);
    return data;
  },

  rejectManagerRequest: async (userId: string) => {
    const { data } = await axiosClient.post<{ message: string }>(`/admin/manager-requests/${userId}/reject`);
    return data;
  },

  getInvitations: async () => {
    const { data } = await axiosClient.get<ManagerInvitationDto[]>('/admin/manager-invitations');
    return data;
  },

  createInvitation: async (payload: { email: string; departmentId?: string; expiresInDays?: number }) => {
    const { data } = await axiosClient.post<ManagerInvitationDto>('/admin/manager-invitations', payload);
    return data;
  },

  revokeInvitation: async (id: string) => {
    await axiosClient.delete(`/admin/manager-invitations/${id}`);
  },
};
