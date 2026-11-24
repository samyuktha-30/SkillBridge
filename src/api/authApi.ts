import { axiosClient } from './axiosClient';
import type {
  AuthResponse,
  EmployeeRegisterRequest,
  LoginRequest,
  ManagerRegisterRequest,
  ManagerRegisterResult,
} from '../types/auth.types';
import type { DepartmentOption, JobRoleOption } from '../types/common.types';

export const authApi = {
  login: async (payload: LoginRequest) => {
    const { data } = await axiosClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  registerEmployee: async (payload: EmployeeRegisterRequest) => {
  const { data } = await axiosClient.post<{ message: string }>(
    '/auth/register/employee',
    payload
  );
  return data;
},

  registerManager: async (payload: ManagerRegisterRequest) => {
    const { data } = await axiosClient.post<ManagerRegisterResult>('/auth/register/manager', payload);
    return data;
  },

  logout: async (refreshToken?: string | null) => {
    await axiosClient.post('/auth/logout', { refreshToken });
  },

  forgotPassword: async (email: string) => {
    const { data } = await axiosClient.post<{ message: string; resetTokenPreview?: string }>(
      '/auth/forgot-password',
      { email }
    );
    return data;
  },

  resetPassword: async (payload: { email: string; token: string; newPassword: string }) => {
    const { data } = await axiosClient.post<{ message: string }>('/auth/reset-password', payload);
    return data;
  },

  getDepartments: async () => {
    const { data } = await axiosClient.get<DepartmentOption[]>('/lookup/departments');
    return data;
  },

  getJobRoles: async () => {
    const { data } = await axiosClient.get<JobRoleOption[]>('/lookup/job-roles');
    return data;
  },
};
