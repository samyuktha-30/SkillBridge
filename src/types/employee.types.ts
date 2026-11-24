export interface SkillOverviewPoint {
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
}

export interface RoadmapStepSummary {
  moduleId: string;
  orderIndex: number;
  title: string;
  description: string;
  dueDateLabel?: string;
  estimatedHours: number;
  status: 'Completed' | 'InProgress' | 'Upcoming' | 'Locked';
}

export interface ResourceCardDto {
  id: string;
  title: string;
  description: string;
  provider: string;
  category: string;
  resourceType: 'Course' | 'Video' | 'Article' | 'Practice';
  difficulty: string;
  durationLabel: string;
  url: string;
  skillName: string;
  isRecommended: boolean;
  relevanceReason?: string;
}

export interface UpcomingActivityDto {
  id: string;
  title: string;
  dueLabel: string;
  daysLeftLabel: string;
  actionRoute: string;
}

export interface EmployeeDashboardDto {
  firstName: string;
  targetRoleTitle: string;
  batchLabel: string;
  assessmentStatusLabel: string;
  lastAssessedLabel: string;
  skillGapsCount: number;
  learningPlanPercent: number;
  overallProgressPercent: number;
  radarSkills: SkillOverviewPoint[];
  roadmapSteps: RoadmapStepSummary[];
  recommendedResources: ResourceCardDto[];
  upcomingActivities: UpcomingActivityDto[];
}

export interface EmployeeSkillItemDto {
  skillId: string;
  code: string;
  name: string;
  category: 'Technical' | 'Soft';
  currentLevel: number;
  requiredLevel: number;
  gapLevel: number;
  status: 'Met' | 'Gap';
}

export interface EmployeeSkillsOverviewDto {
  targetRoleId?: string;
  targetRoleTitle: string;
  overallSkillScorePercent: number;
  scoreDeltaLabel: string;
  skillsMetCount: number;
  totalSkillsCount: number;
  skillsWithGapCount: number;
  improvementGoalPercent: number;
  methodologyNote: string;
  skills: EmployeeSkillItemDto[];
  radarSkills: SkillOverviewPoint[];
  recentAssessments: {
    attemptId: string;
    title: string;
    completedOnLabel: string;
    scorePercent: number;
    passed: boolean;
  }[];
  keyInsight: string;
}

export interface AssessmentListItemDto {
  assessmentId: string;
  attemptId?: string;
  title: string;
  subtitle: string;
  category: string;
  dateLabel: string;
  dateCaption: string;
  durationOrScoreLabel: string;
  durationOrScoreCaption: string;
  status: 'Completed' | 'Pending' | 'Upcoming' | 'InProgress';
  scorePercent?: number;
}

export interface AssessmentsOverviewDto {
  nextAssessmentTitle?: string;
  nextAssessmentDueLabel?: string;
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  upcomingCount: number;
  assessments: AssessmentListItemDto[];
}

export interface AssessmentQuestionDto {
  questionId: string;
  skillName: string;
  prompt: string;
  options: string[];
}

export interface AssessmentSessionDto {
  attemptId: string;
  assessmentId: string;
  title: string;
  durationMinutes: number;
  questions: AssessmentQuestionDto[];
}

export interface AssessmentResultDto {
  attemptId: string;
  title: string;
  scorePercent: number;
  passed: boolean;
  completedAtUtc: string;
  skillBreakdown: {
    skillName: string;
    correctCount: number;
    totalQuestions: number;
    updatedLevel: number;
    requiredLevel: number;
  }[];
}

export interface LearningPlanOverviewDto {
  hasPlan: boolean;
  planId?: string;
  title: string;
  targetRoleTitle: string;
  planProgressPercent: number;
  statusLabel: string;
  completedModulesCount: number;
  totalModulesCount: number;
  timelineLabel: string;
  goalLabel: string;
  isAiGenerated: boolean;
  steps: RoadmapStepSummary[];
  recommendedResources: ResourceCardDto[];
}

export interface EmployeeProgressDto {
  overallProgressPercent: number;
  assessmentsCompleted: number;
  totalAssessments: number;
  skillsImprovedCount: number;
  learningHours: number;
  series: { label: string; score: number }[];
  skillPerformance: { skillName: string; percent: number }[];
  achievements: { id: string; title: string; unlocked: boolean; unlockedAtLabel?: string }[];
  recentActivities: { id: string; summary: string; relativeTimeLabel: string }[];
}

export interface AiChatMessageDto {
  id: string;
  sender: 'User' | 'Assistant';
  content: string;
  codeSnippet?: string;
  timestampLabel: string;
  relatedResources?: { title: string; provider: string; url: string }[];
}

export interface AiChatSessionDto {
  sessionId: string;
  mode: string;
  messages: AiChatMessageDto[];
}

export interface NotificationItemDto {
  id: string;
  category: 'Assessment' | 'Learning' | 'System' | 'Reminder';
  title: string;
  message: string;
  relativeTimeLabel: string;
  createdAtLabel: string;
  isRead: boolean;
  actionLabel?: string;
  actionRoute?: string;
}

export interface UserSettingsDto {
  fullName: string;
  email: string;
  employeeCode: string;
  departmentName: string;
  phoneNumber?: string;
  location?: string;
  jobTitle?: string;
  assessmentReminders: boolean;
  learningPlanUpdates: boolean;
  trainingDeadlineAlerts: boolean;
  systemAnnouncements: boolean;
  emailNotifications: boolean;
  monthlyReportDelivery: boolean;
  theme: 'Light' | 'Dark';
  language: string;
  timeZone: string;
  defaultTeamView: string;
  twoFactorEnabled: boolean;
}

export interface ActiveSessionDto {
  id: string;
  createdAtUtc: string;
  expiresAtUtc: string;
  isCurrent: boolean;
}
