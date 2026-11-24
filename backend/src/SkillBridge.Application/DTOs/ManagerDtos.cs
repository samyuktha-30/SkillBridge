namespace SkillBridge.Application.DTOs;

public record SkillAverageDto(string SkillName, int CurrentPercent);
public record EmployeePerformanceBarDto(string EmployeeName, int ScorePercent);
public record EmployeeAttentionRowDto(Guid EmployeeId, string Initials, string EmployeeName, string DepartmentName, string PrimaryGapSkill, int ProgressPercent);
public record TrainingProgressBreakdownDto(int TotalEmployees, int NotStartedCount, int InProgressCount, int CompletedCount);
public record ManagerRecentActivityDto(Guid Id, string Category, string Title, string Subtitle, string TimeLabel);

public record ManagerDashboardDto(
    int TotalEmployees,
    int ActiveEmployees,
    int AssessmentsCompleted,
    int EmployeesRequiringTraining,
    int TargetProficiencyPercent,
    List<SkillAverageDto> SkillGapOverview,
    List<EmployeePerformanceBarDto> EmployeePerformance,
    List<EmployeeAttentionRowDto> EmployeesNeedingAttention,
    TrainingProgressBreakdownDto TrainingProgress,
    List<ManagerRecentActivityDto> RecentActivities);

public record CandidateDto(
    Guid Id,
    string FullName,
    string Email,
    Guid JobRoleId,
    string JobRoleTitle,
    Guid DepartmentId,
    string DepartmentName,
    string Stage,
    int? SkillScorePercent,
    string? NextFollowUpDate,
    string? Notes);

public record CandidatesOverviewDto(
    int ActiveCandidatesCount,
    int OpenRolesCount,
    int AwaitingAssessmentCount,
    int InInterviewCount,
    int OfferStageCount,
    List<CandidateDto> Candidates,
    string NextStepSummary);

public record CreateCandidateDto(string FullName, string Email, Guid JobRoleId, Guid DepartmentId, string Stage, string? NextFollowUpDate, string? Notes);
public record UpdateCandidateDto(string Stage, int? SkillScorePercent, string? NextFollowUpDate, string? Notes);

public record PlanCourseRowDto(Guid ModuleId, string Title, string SkillName, string Status);
public record ManagerEmployeePlanRowDto(
    Guid? EmployeeLearningPlanId,
    Guid EmployeeId,
    string EmployeeName,
    string DepartmentName,
    string PlanTitle,
    int CompletedCourses,
    int TotalCourses,
    int ProgressPercent,
    string DueDateLabel,
    string Status,
    List<PlanCourseRowDto> Courses,
    string TargetsSummary,
    string NextActionSummary);

public record EmployeeSelectOptionDto(Guid Id, string FullName, string DepartmentName);
public record PlanTemplateOptionDto(Guid Id, string Title, string TargetRoleTitle);
public record LearningPlanManagementDto(
    List<EmployeeSelectOptionDto> Employees,
    List<PlanTemplateOptionDto> PlanTemplates,
    List<ManagerEmployeePlanRowDto> AssignedPlans);

public record AssignLearningPlanDto(Guid EmployeeId, Guid LearningPlanId, DateTime DueDate);
public record CreateModuleTemplateDto(string Title, string Description, Guid SkillId, decimal EstimatedHours);
public record CreateLearningPlanTemplateDto(string Title, Guid TargetRoleId, int EstimatedWeeks, List<CreateModuleTemplateDto> Modules);
public record SendReminderRequestDto(Guid EmployeeId, string? Message);

public record TrainingMonitoringDto(
    int AssignedPlansCount,
    int CompletedPlansCount,
    int NeedsAttentionCount,
    int DepartmentsCount,
    List<ManagerEmployeePlanRowDto> Rows,
    string FollowUpSummary,
    string NextReviewDateLabel);

public record ClusterInsightDto(string ClusterLabel, int EmployeeCount, List<string> FocusSkills);
public record PrioritySkillGapDto(string SkillName, int EmployeesBelowCount);
public record RecommendedActionItemDto(string Title, string Description);
public record EmployeeSkillGapRowDto(Guid EmployeeId, string EmployeeName, string SkillName, int? CurrentLevel, int? RequiredLevel, string GapLabel, string RecommendedAction);

public record SkillGapAnalyticsDto(
    int AssessedEmployeesCount,
    int TotalEmployeesCount,
    int EmployeesWithGapsCount,
    int MeetingRequirementsCount,
    string AnalysisMethodology,
    List<ClusterInsightDto> ClusterInsights,
    List<PrioritySkillGapDto> PrioritySkills,
    List<RecommendedActionItemDto> RecommendedActions,
    List<EmployeeSkillGapRowDto> EmployeeSkillGaps);

public record ManagerProfileDto(
    string FullName,
    string Email,
    string? PhoneNumber,
    string? Location,
    string JobTitle,
    string EmployeeCode,
    string DepartmentName,
    int ManagedEmployeesCount,
    string ManagedDepartmentsLabel,
    int AssessedEmployeesCount,
    int EmployeesWithGapsCount,
    string ReviewCadence,
    string NextReviewDateLabel,
    string AccessStatus);

public record ReportRecordDto(Guid Id, string Title, string ReportType, string DepartmentName, string GeneratedOnLabel, string CreatedByName, string Format);
public record ReportScheduleDto(Guid Id, string ReportType, string FrequencyCron, string FrequencyLabel, string RecipientEmail, bool IsActive);
public record ManagerReportsDto(
    int TotalEmployeesCount,
    int AssessedEmployeesCount,
    int EmployeesWithGapsCount,
    int AssignedPlansCount,
    int CompletedPlansCount,
    List<ReportRecordDto> RecentReports,
    ReportScheduleDto? Schedule);

public record GenerateReportRequestDto(string ReportType, Guid? DepartmentId, string DateRangeLabel, string Format);
public record SaveReportScheduleDto(string ReportType, string FrequencyCron, string RecipientEmail, bool IsActive);

// Employee access approval management
public record EmployeeAccessDto(
    Guid EmployeeId,
    string FullName,
    string Email,
    string DepartmentName,
    string ApprovalStatus);

public record EmployeeAccessListDto(
    int TotalEmployees,
    int PendingCount,
    int ActiveCount,
    List<EmployeeAccessDto> Employees);

public record UpdateEmployeeApprovalDto(bool Approve);