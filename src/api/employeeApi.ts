import { axiosClient } from './axiosClient';
import type { PaginatedResult } from '../types/common.types';
import type {
  ActiveSessionDto,
  AiChatMessageDto,
  AiChatSessionDto,
  AssessmentResultDto,
  AssessmentSessionDto,
  AssessmentsOverviewDto,
  EmployeeDashboardDto,
  EmployeeProgressDto,
  EmployeeSkillsOverviewDto,
  LearningPlanOverviewDto,
  NotificationItemDto,
  ResourceCardDto,
  UserSettingsDto,
} from '../types/employee.types';

export const employeeApi = {
  getDashboard: async () => {
    const { data } = await axiosClient.get<EmployeeDashboardDto>('/employee/dashboard');
    return data;
  },

  getSkills: async (category?: string) => {
    const { data } = await axiosClient.get<EmployeeSkillsOverviewDto>('/employee/skills', {
      params: category && category !== 'All' ? { category } : undefined,
    });
    return data;
  },

  updateTargetRole: async (jobRoleId: string) => {
    const { data } = await axiosClient.put<{ targetRoleTitle: string }>('/employee/target-role', { jobRoleId });
    return data;
  },

  getAssessments: async (params?: { status?: string; search?: string; category?: string }) => {
    const { data } = await axiosClient.get<AssessmentsOverviewDto>('/employee/assessments', { params });
    return data;
  },

  startAssessment: async (assessmentId: string) => {
    const { data } = await axiosClient.post<AssessmentSessionDto>(`/employee/assessments/${assessmentId}/start`);
    return data;
  },

  submitAssessment: async (
    assessmentId: string,
    payload: { attemptId: string; answers: { questionId: string; selectedOptionIndex: number }[] }
  ) => {
    const { data } = await axiosClient.post<AssessmentResultDto>(
      `/employee/assessments/${assessmentId}/submit`,
      payload
    );
    return data;
  },

  getAssessmentResult: async (attemptId: string) => {
    const { data } = await axiosClient.get<AssessmentResultDto>(`/employee/assessments/attempts/${attemptId}`);
    return data;
  },

  getLearningPlan: async () => {
    const { data } = await axiosClient.get<LearningPlanOverviewDto>('/employee/learning-plan');
    return data;
  },

  generateLearningPlan: async () => {
    const { data } = await axiosClient.post<LearningPlanOverviewDto>('/employee/learning-plan/generate');
    return data;
  },

  updateModuleStatus: async (moduleId: string, status: 'InProgress' | 'Completed') => {
    const { data } = await axiosClient.patch<LearningPlanOverviewDto>(
      `/employee/learning-plan/modules/${moduleId}`,
      { status }
    );
    return data;
  },

  getResources: async (params?: { search?: string; category?: string; resourceType?: string }) => {
    const { data } = await axiosClient.get<{
      learningGoalLabel: string;
      featured: ResourceCardDto[];
      recommended: ResourceCardDto[];
    }>('/employee/resources', { params });
    return data;
  },

  getProgress: async (range: '1M' | '3M' | '6M' | '1Y' = '1M') => {
    const { data } = await axiosClient.get<EmployeeProgressDto>('/employee/progress', {
      params: { range },
    });
    return data;
  },

  getChatSession: async (mode: string) => {
    const { data } = await axiosClient.get<AiChatSessionDto>('/employee/ai-assistant/session', {
      params: { mode },
    });
    return data;
  },

  sendChatMessage: async (payload: { mode: string; message: string }) => {
    const { data } = await axiosClient.post<{
      userMessage: AiChatMessageDto;
      assistantMessage: AiChatMessageDto;
    }>('/employee/ai-assistant/message', payload);
    return data;
  },

  getNotifications: async (params?: { category?: string; page?: number; pageSize?: number }) => {
    const { data } = await axiosClient.get<PaginatedResult<NotificationItemDto>>('/notifications', {
      params,
    });
    return data;
  },

  markNotificationRead: async (id: string) => {
    await axiosClient.patch(`/notifications/${id}/read`);
  },

  getSettings: async () => {
    const { data } = await axiosClient.get<UserSettingsDto>('/settings');
    return data;
  },

  updateProfile: async (payload: {
    fullName: string;
    phoneNumber?: string;
    location?: string;
    jobTitle?: string;
  }) => {
    const { data } = await axiosClient.put<UserSettingsDto>('/settings/profile', payload);
    return data;
  },

  updateSettings: async (payload: Partial<UserSettingsDto>) => {
    const { data } = await axiosClient.put<UserSettingsDto>('/settings', payload);
    return data;
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const { data } = await axiosClient.post<{ message: string }>('/settings/change-password', payload);
    return data;
  },

  getActiveSessions: async () => {
    const { data } = await axiosClient.get<ActiveSessionDto[]>('/settings/sessions');
    return data;
  },

  exportMyData: async () => {
    const { data } = await axiosClient.get('/settings/export-data', { responseType: 'blob' });
    return data as Blob;
  },

  deleteAccount: async () => {
    await axiosClient.delete('/settings/account');
  },
};
