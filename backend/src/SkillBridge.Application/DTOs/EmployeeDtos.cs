namespace SkillBridge.Application.DTOs;

public record SkillOverviewPointDto(string SkillName, int CurrentLevel, int RequiredLevel);

public record RoadmapStepSummaryDto(
    Guid ModuleId,
    int OrderIndex,
    string Title,
    string Description,
    string? DueDateLabel,
    decimal EstimatedHours,
    string Status);

public record ResourceCardDto(
    Guid Id,
    string Title,
    string Description,
    string Provider,
    string Category,
    string ResourceType,
    string Difficulty,
    string DurationLabel,
    string Url,
    string SkillName,
    bool IsRecommended,
    string? RelevanceReason);

public record UpcomingActivityDto(Guid Id, string Title, string DueLabel, string DaysLeftLabel, string ActionRoute);

public record EmployeeDashboardDto(
    string FirstName,
    string TargetRoleTitle,
    string BatchLabel,
    string AssessmentStatusLabel,
    string LastAssessedLabel,
    int SkillGapsCount,
    int LearningPlanPercent,
    int OverallProgressPercent,
    List<SkillOverviewPointDto> RadarSkills,
    List<RoadmapStepSummaryDto> RoadmapSteps,
    List<ResourceCardDto> RecommendedResources,
    List<UpcomingActivityDto> UpcomingActivities);

public record EmployeeSkillItemDto(
    Guid SkillId,
    string Code,
    string Name,
    string Category,
    int CurrentLevel,
    int RequiredLevel,
    int GapLevel,
    string Status);

public record RecentAssessmentSummaryDto(Guid AttemptId, string Title, string CompletedOnLabel, int ScorePercent, bool Passed);

public record EmployeeSkillsOverviewDto(
    Guid? TargetRoleId,
    string TargetRoleTitle,
    int OverallSkillScorePercent,
    string ScoreDeltaLabel,
    int SkillsMetCount,
    int TotalSkillsCount,
    int SkillsWithGapCount,
    int ImprovementGoalPercent,
    string MethodologyNote,
    List<EmployeeSkillItemDto> Skills,
    List<SkillOverviewPointDto> RadarSkills,
    List<RecentAssessmentSummaryDto> RecentAssessments,
    string KeyInsight);

public record UpdateTargetRoleDto(Guid JobRoleId);

public record AssessmentListItemDto(
    Guid AssessmentId,
    Guid? AttemptId,
    string Title,
    string Subtitle,
    string Category,
    string DateLabel,
    string DateCaption,
    string DurationOrScoreLabel,
    string DurationOrScoreCaption,
    string Status,
    int? ScorePercent);

public record AssessmentsOverviewDto(
    string? NextAssessmentTitle,
    string? NextAssessmentDueLabel,
    int TotalCount,
    int CompletedCount,
    int PendingCount,
    int UpcomingCount,
    List<AssessmentListItemDto> Assessments);

public record AssessmentQuestionDto(Guid QuestionId, string SkillName, string Prompt, List<string> Options);
public record AssessmentSessionDto(Guid AttemptId, Guid AssessmentId, string Title, int DurationMinutes, List<AssessmentQuestionDto> Questions);
public record SubmitAnswerDto(Guid QuestionId, int SelectedOptionIndex);
public record SubmitAssessmentRequestDto(Guid AttemptId, List<SubmitAnswerDto> Answers);
public record SkillBreakdownResultDto(string SkillName, int CorrectCount, int TotalQuestions, int UpdatedLevel, int RequiredLevel);
public record AssessmentResultDto(Guid AttemptId, string Title, int ScorePercent, bool Passed, DateTime CompletedAtUtc, List<SkillBreakdownResultDto> SkillBreakdown);

public record LearningPlanOverviewDto(
    bool HasPlan,
    Guid? PlanId,
    string Title,
    string TargetRoleTitle,
    int PlanProgressPercent,
    string StatusLabel,
    int CompletedModulesCount,
    int TotalModulesCount,
    string TimelineLabel,
    string GoalLabel,
    bool IsAiGenerated,
    List<RoadmapStepSummaryDto> Steps,
    List<ResourceCardDto> RecommendedResources);

public record ResourcesOverviewDto(
    string LearningGoalLabel,
    List<ResourceCardDto> Featured,
    List<ResourceCardDto> Recommended);

public record UpdateTargetRoleResponseDto(string TargetRoleTitle);

public record UpdateModuleStatusDto(string Status);

public record ProgressPointDto(string Label, int Score);
public record SkillPerformanceBarDto(string SkillName, int Percent);
public record AchievementBadgeDto(Guid Id, string Title, bool Unlocked, string? UnlockedAtLabel);
public record ActivityFeedItemDto(Guid Id, string Summary, string RelativeTimeLabel);

public record EmployeeProgressDto(
    int OverallProgressPercent,
    int AssessmentsCompleted,
    int TotalAssessments,
    int SkillsImprovedCount,
    decimal LearningHours,
    List<ProgressPointDto> Series,
    List<SkillPerformanceBarDto> SkillPerformance,
    List<AchievementBadgeDto> Achievements,
    List<ActivityFeedItemDto> RecentActivities);

public record RelatedResourceLinkDto(string Title, string Provider, string Url);
public record AiChatMessageDto(Guid Id, string Sender, string Content, string? CodeSnippet, string TimestampLabel, List<RelatedResourceLinkDto>? RelatedResources);
public record AiChatSessionDto(Guid SessionId, string Mode, List<AiChatMessageDto> Messages);
public record SendChatMessageRequestDto(string Mode, string Message);
public record SendChatMessageResponseDto(AiChatMessageDto UserMessage, AiChatMessageDto AssistantMessage);

public record NotificationItemDto(
    Guid Id,
    string Category,
    string Title,
    string Message,
    string RelativeTimeLabel,
    string CreatedAtLabel,
    bool IsRead,
    string? ActionLabel,
    string? ActionRoute);

public record PaginatedResultDto<T>(List<T> Items, int TotalCount, int Page, int PageSize, int TotalPages);

public record UserSettingsDto(
    string FullName,
    string Email,
    string EmployeeCode,
    string DepartmentName,
    string? PhoneNumber,
    string? Location,
    string? JobTitle,
    bool AssessmentReminders,
    bool LearningPlanUpdates,
    bool TrainingDeadlineAlerts,
    bool SystemAnnouncements,
    bool EmailNotifications,
    bool MonthlyReportDelivery,
    string Theme,
    string Language,
    string TimeZone,
    string DefaultTeamView,
    bool TwoFactorEnabled);

public record UpdateSettingsRequestDto(
    bool? AssessmentReminders,
    bool? LearningPlanUpdates,
    bool? TrainingDeadlineAlerts,
    bool? SystemAnnouncements,
    bool? EmailNotifications,
    bool? MonthlyReportDelivery,
    string? Theme,
    string? Language,
    string? TimeZone,
    string? DefaultTeamView,
    bool? TwoFactorEnabled);

public record UpdateProfileRequestDto(string FullName, string? PhoneNumber, string? Location, string? JobTitle);
public record ActiveSessionDto(Guid Id, DateTime CreatedAtUtc, DateTime ExpiresAtUtc, bool IsCurrent);
