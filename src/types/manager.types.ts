export interface ManagerDashboardDto {
  totalEmployees: number;
  activeEmployees: number;
  assessmentsCompleted: number;
  employeesRequiringTraining: number;
  targetProficiencyPercent: number;
  skillGapOverview: { skillName: string; currentPercent: number }[];
  employeePerformance: { employeeName: string; scorePercent: number }[];
  employeesNeedingAttention: {
    employeeId: string;
    initials: string;
    employeeName: string;
    departmentName: string;
    primaryGapSkill: string;
    progressPercent: number;
  }[];
  trainingProgress: {
    totalEmployees: number;
    notStartedCount: number;
    inProgressCount: number;
    completedCount: number;
  };
  recentActivities: {
    id: string;
    category: string;
    title: string;
    subtitle: string;
    timeLabel: string;
  }[];
}

export interface CandidateDto {
  id: string;
  fullName: string;
  email: string;
  jobRoleId: string;
  jobRoleTitle: string;
  departmentId: string;
  departmentName: string;
  stage: 'Screening' | 'Assessment' | 'Interview' | 'Offer' | 'Hired';
  skillScorePercent?: number;
  nextFollowUpDate?: string;
  notes?: string;
}

export interface CandidatesOverviewDto {
  activeCandidatesCount: number;
  openRolesCount: number;
  awaitingAssessmentCount: number;
  inInterviewCount: number;
  offerStageCount: number;
  candidates: CandidateDto[];
  nextStepSummary: string;
}

export interface ManagerEmployeePlanRowDto {
  employeeLearningPlanId?: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  planTitle: string;
  completedCourses: number;
  totalCourses: number;
  progressPercent: number;
  dueDateLabel: string;
  status: 'InProgress' | 'NotStarted' | 'Completed' | 'AssessFirst';
  courses: {
    moduleId: string;
    title: string;
    skillName: string;
    status: string;
  }[];
  targetsSummary: string;
  nextActionSummary: string;
}

export interface LearningPlanManagementDto {
  employees: { id: string; fullName: string; departmentName: string }[];
  planTemplates: { id: string; title: string; targetRoleTitle: string }[];
  assignedPlans: ManagerEmployeePlanRowDto[];
}

export interface TrainingMonitoringDto {
  assignedPlansCount: number;
  completedPlansCount: number;
  needsAttentionCount: number;
  departmentsCount: number;
  rows: ManagerEmployeePlanRowDto[];
  followUpSummary: string;
  nextReviewDateLabel: string;
}

export interface SkillGapAnalyticsDto {
  assessedEmployeesCount: number;
  totalEmployeesCount: number;
  employeesWithGapsCount: number;
  meetingRequirementsCount: number;
  analysisMethodology: string;
  clusterInsights: {
    clusterLabel: string;
    employeeCount: number;
    focusSkills: string[];
  }[];
  prioritySkills: {
    skillName: string;
    employeesBelowCount: number;
  }[];
  recommendedActions: {
    title: string;
    description: string;
  }[];
  employeeSkillGaps: {
    employeeId: string;
    employeeName: string;
    skillName: string;
    currentLevel?: number;
    requiredLevel?: number;
    gapLabel: string;
    recommendedAction: string;
  }[];
}

export interface ManagerProfileDto {
  fullName: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  jobTitle: string;
  employeeCode: string;
  departmentName: string;
  managedEmployeesCount: number;
  managedDepartmentsLabel: string;
  assessedEmployeesCount: number;
  employeesWithGapsCount: number;
  reviewCadence: string;
  nextReviewDateLabel: string;
  accessStatus: string;
}

export interface ReportRecordDto {
  id: string;
  title: string;
  reportType: string;
  departmentName: string;
  generatedOnLabel: string;
  createdByName: string;
  format: 'PDF' | 'CSV';
}

export interface ReportScheduleDto {
  id: string;
  reportType: string;
  frequencyCron: string;
  frequencyLabel: string;
  recipientEmail: string;
  isActive: boolean;
}

export interface ManagerReportsDto {
  totalEmployeesCount: number;
  assessedEmployeesCount: number;
  employeesWithGapsCount: number;
  assignedPlansCount: number;
  completedPlansCount: number;
  recentReports: ReportRecordDto[];
  schedule?: ReportScheduleDto;
}

export interface EmployeeAccessDto {
  employeeId: string;
  fullName: string;
  email: string;
  departmentName: string;
  approvalStatus: string;
}

export interface EmployeeAccessListDto {
  totalEmployees: number;
  pendingCount: number;
  activeCount: number;
  employees: EmployeeAccessDto[];
}