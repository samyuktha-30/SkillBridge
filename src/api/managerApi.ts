import { axiosClient } from './axiosClient';
import type {
  CandidateDto,
  CandidatesOverviewDto,
  EmployeeAccessListDto,
  LearningPlanManagementDto,
  ManagerDashboardDto,
  ManagerProfileDto,
  ManagerReportsDto,
  ReportRecordDto,
  SkillGapAnalyticsDto,
  TrainingMonitoringDto,
} from '../types/manager.types';

export const managerApi = {
  getDashboard: async () => {
    const { data } = await axiosClient.get<ManagerDashboardDto>('/manager/dashboard');
    return data;
  },

  getEmployeeApprovals: async () => {
  const { data } = await axiosClient.get<EmployeeAccessListDto>(
    '/manager/employee-approvals'
  );
  return data;
},

updateEmployeeApproval: async (employeeId: string, approve: boolean) => {
  const { data } = await axiosClient.put<{ message: string }>(
    `/manager/employees/${employeeId}/approval`,
    { approve }
  );
  return data;
},

  getCandidates: async (params?: { search?: string; jobRoleId?: string; stage?: string }) => {
    const { data } = await axiosClient.get<CandidatesOverviewDto>('/manager/candidates', { params });
    return data;
  },

  createCandidate: async (payload: {
    fullName: string;
    email: string;
    jobRoleId: string;
    departmentId: string;
    stage: string;
    nextFollowUpDate?: string;
    notes?: string;
  }) => {
    const { data } = await axiosClient.post<CandidateDto>('/manager/candidates', payload);
    return data;
  },

  updateCandidateStage: async (
    id: string,
    payload: { stage: string; skillScorePercent?: number; nextFollowUpDate?: string; notes?: string }
  ) => {
    const { data } = await axiosClient.put<CandidateDto>(`/manager/candidates/${id}`, payload);
    return data;
  },

  getLearningPlanManagement: async (params?: { status?: string; departmentId?: string }) => {
    const { data } = await axiosClient.get<LearningPlanManagementDto>('/manager/learning-plans', { params });
    return data;
  },

  assignLearningPlan: async (payload: { employeeId: string; learningPlanId: string; dueDate: string }) => {
    const { data } = await axiosClient.post('/manager/learning-plans/assign', payload);
    return data;
  },

  createLearningPlanTemplate: async (payload: {
    title: string;
    targetRoleId: string;
    estimatedWeeks: number;
    modules: { title: string; description: string; skillId: string; estimatedHours: number }[];
  }) => {
    const { data } = await axiosClient.post('/manager/learning-plans/templates', payload);
    return data;
  },

  sendTrainingReminder: async (employeeId: string, message?: string) => {
    const { data } = await axiosClient.post<{ message: string }>('/manager/training-monitoring/remind', {
      employeeId,
      message,
    });
    return data;
  },

  getTrainingMonitoring: async (params?: { search?: string; departmentId?: string; status?: string }) => {
    const { data } = await axiosClient.get<TrainingMonitoringDto>('/manager/training-monitoring', { params });
    return data;
  },

  getSkillGapAnalytics: async (params?: {
    departmentId?: string;
    jobRoleId?: string;
    assessmentId?: string;
  }) => {
    const { data } = await axiosClient.get<SkillGapAnalyticsDto>('/manager/skill-gap-analytics', { params });
    return data;
  },

  exportSkillGapAnalysis: async (params?: { departmentId?: string; jobRoleId?: string }) => {
    const { data } = await axiosClient.get('/manager/skill-gap-analytics/export', {
      params,
      responseType: 'blob',
    });
    return data as Blob;
  },

  getProfile: async () => {
    const { data } = await axiosClient.get<ManagerProfileDto>('/manager/profile');
    return data;
  },

  getReports: async () => {
    const { data } = await axiosClient.get<ManagerReportsDto>('/manager/reports');
    return data;
  },

  generateReport: async (payload: {
    reportType: string;
    departmentId?: string;
    dateRangeLabel: string;
    format: 'PDF' | 'CSV';
  }) => {
    const { data } = await axiosClient.post<ReportRecordDto>('/manager/reports', payload);
    return data;
  },

  downloadReport: async (reportId: string) => {
    const { data } = await axiosClient.get(`/manager/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return data as Blob;
  },

  saveReportSchedule: async (payload: {
    reportType: string;
    frequencyCron: string;
    recipientEmail: string;
    isActive: boolean;
  }) => {
    const { data } = await axiosClient.put('/manager/reports/schedule', payload);
    return data;
  },
};
