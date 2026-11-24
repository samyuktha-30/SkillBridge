using SkillBridge.Application.DTOs;
using SkillBridge.Domain.Entities;
using SkillBridge.Domain.Enums;

namespace SkillBridge.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? IdentityUserId { get; }
    Guid? UserProfileId { get; }
    string? Email { get; }
    UserRole? Role { get; }
}

public interface IIdentityAuthService
{
    Task<(bool Succeeded, Guid IdentityUserId, string[] Errors)> CreateIdentityUserAsync(
        string email, string password, string roleName, CancellationToken ct = default);
    Task<bool> CheckPasswordAsync(Guid identityUserId, string password, CancellationToken ct = default);
    Task<string?> GeneratePasswordResetTokenAsync(string email, CancellationToken ct = default);
    Task<(bool Succeeded, string[] Errors)> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken ct = default);
    Task<(bool Succeeded, string[] Errors)> ChangePasswordAsync(Guid identityUserId, string currentPassword, string newPassword, CancellationToken ct = default);
    Task DeleteIdentityUserAsync(Guid identityUserId, CancellationToken ct = default);
}

public interface IJwtTokenService
{
    (string AccessToken, DateTime ExpiresAtUtc) GenerateAccessToken(UserProfile profile);
    string GenerateOpaqueRefreshToken();
    string HashToken(string rawToken);
}

public interface IAiServiceClient
{
    Task<AiClusterAnalysisResponseDto> AnalyzeSkillClustersAsync(AiClusterAnalysisRequestDto request, CancellationToken ct = default);
    Task<AiGeneratePlanResponseDto> GenerateLearningPlanAsync(AiGeneratePlanRequestDto request, CancellationToken ct = default);
    Task<AiChatReplyDto> ChatAsync(AiChatRequestDto request, CancellationToken ct = default);
    Task<AiResourceRecommendationResponseDto> RecommendResourcesAsync(AiResourceRecommendationRequestDto request, CancellationToken ct = default);
}

public interface IReportExporter
{
    byte[] ExportSkillGapCsv(IEnumerable<EmployeeSkillGapRowDto> rows);
    byte[] ExportSummaryCsv(string reportTitle, IEnumerable<(string Col1, string Col2, string Col3, string Col4)> rows, string[] headers);
    byte[] ExportSummaryPdf(string reportTitle, string departmentName, string generatedBy, IEnumerable<(string Col1, string Col2, string Col3, string Col4)> rows, string[] headers);
}

public interface IBackgroundJobScheduler
{
    void EnqueueTrainingReminderNotification(Guid employeeProfileId, string message);
    void UpsertScheduledReportJob(Guid scheduleId, string cronExpression);
    void RemoveScheduledReportJob(Guid scheduleId);
}

public interface IAuthService
{
    Task<MessageResponseDto> RegisterEmployeeAsync(EmployeeRegisterRequestDto request, CancellationToken ct = default);
    Task<ManagerRegisterResultDto> RegisterManagerAsync(ManagerRegisterRequestDto request, CancellationToken ct = default);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken ct = default);
    Task<AuthResponseDto> RefreshAsync(RefreshTokenRequestDto request, CancellationToken ct = default);
    Task LogoutAsync(Guid? userProfileId, string? refreshToken, CancellationToken ct = default);
    Task<ForgotPasswordResponseDto> ForgotPasswordAsync(ForgotPasswordRequestDto request, CancellationToken ct = default);
    Task<MessageResponseDto> ResetPasswordAsync(ResetPasswordRequestDto request, CancellationToken ct = default);
}

public interface ILookupService
{
    Task<List<DepartmentOptionDto>> GetDepartmentsAsync(CancellationToken ct = default);
    Task<List<JobRoleOptionDto>> GetJobRolesAsync(CancellationToken ct = default);
}

public interface IAdminService
{
    Task<List<ManagerRequestDto>> GetPendingManagerRequestsAsync(CancellationToken ct = default);
    Task<MessageResponseDto> ApproveManagerRequestAsync(Guid userProfileId, CancellationToken ct = default);
    Task<MessageResponseDto> RejectManagerRequestAsync(Guid userProfileId, CancellationToken ct = default);
    Task<List<ManagerInvitationDto>> GetInvitationsAsync(CancellationToken ct = default);
    Task<ManagerInvitationDto> CreateInvitationAsync(Guid adminProfileId, CreateManagerInvitationDto request, CancellationToken ct = default);
    Task RevokeInvitationAsync(Guid invitationId, CancellationToken ct = default);
}

public interface IEmployeeWorkspaceService
{
    Task<EmployeeDashboardDto> GetDashboardAsync(Guid userProfileId, CancellationToken ct = default);
    Task<EmployeeSkillsOverviewDto> GetSkillsAsync(Guid userProfileId, string? category, CancellationToken ct = default);
    Task<UpdateTargetRoleResponseDto> UpdateTargetRoleAsync(Guid userProfileId, UpdateTargetRoleDto request, CancellationToken ct = default);
    Task<AssessmentsOverviewDto> GetAssessmentsAsync(Guid userProfileId, string? status, string? search, string? category, CancellationToken ct = default);
    Task<AssessmentSessionDto> StartAssessmentAsync(Guid userProfileId, Guid assessmentId, CancellationToken ct = default);
    Task<AssessmentResultDto> SubmitAssessmentAsync(Guid userProfileId, Guid assessmentId, SubmitAssessmentRequestDto request, CancellationToken ct = default);
    Task<AssessmentResultDto> GetAssessmentResultAsync(Guid userProfileId, Guid attemptId, CancellationToken ct = default);
    Task<LearningPlanOverviewDto> GetLearningPlanAsync(Guid userProfileId, CancellationToken ct = default);
    Task<LearningPlanOverviewDto> GenerateLearningPlanAsync(Guid userProfileId, CancellationToken ct = default);
    Task<LearningPlanOverviewDto> UpdateModuleStatusAsync(Guid userProfileId, Guid moduleId, UpdateModuleStatusDto request, CancellationToken ct = default);
    Task<ResourcesOverviewDto> GetResourcesAsync(Guid userProfileId, string? search, string? category, string? resourceType, CancellationToken ct = default);
    Task<EmployeeProgressDto> GetProgressAsync(Guid userProfileId, string range, CancellationToken ct = default);
    Task<AiChatSessionDto> GetChatSessionAsync(Guid userProfileId, string mode, CancellationToken ct = default);
    Task<SendChatMessageResponseDto> SendChatMessageAsync(Guid userProfileId, SendChatMessageRequestDto request, CancellationToken ct = default);
    Task<PaginatedResultDto<NotificationItemDto>> GetNotificationsAsync(Guid userProfileId, string? category, int page, int pageSize, CancellationToken ct = default);
    Task MarkNotificationReadAsync(Guid userProfileId, Guid notificationId, CancellationToken ct = default);
    Task<UserSettingsDto> GetSettingsAsync(Guid userProfileId, CancellationToken ct = default);
    Task<UserSettingsDto> UpdateProfileAsync(Guid userProfileId, UpdateProfileRequestDto request, CancellationToken ct = default);
    Task<UserSettingsDto> UpdateSettingsAsync(Guid userProfileId, UpdateSettingsRequestDto request, CancellationToken ct = default);
    Task<MessageResponseDto> ChangePasswordAsync(Guid identityUserId, ChangePasswordRequestDto request, CancellationToken ct = default);
    Task<List<ActiveSessionDto>> GetActiveSessionsAsync(Guid userProfileId, CancellationToken ct = default);
    Task<byte[]> ExportMyDataAsync(Guid userProfileId, CancellationToken ct = default);
    Task DeleteAccountAsync(Guid userProfileId, CancellationToken ct = default);
}

public interface IManagerWorkspaceService
{
    Task<EmployeeAccessListDto> GetEmployeeApprovalsAsync(
    Guid managerProfileId,
    CancellationToken ct = default);

Task<MessageResponseDto> UpdateEmployeeApprovalAsync(
    Guid managerProfileId,
    Guid employeeId,
    UpdateEmployeeApprovalDto request,
    CancellationToken ct = default);
    Task<ManagerDashboardDto> GetDashboardAsync(Guid managerProfileId, CancellationToken ct = default);
    Task<CandidatesOverviewDto> GetCandidatesAsync(Guid managerProfileId, string? search, Guid? jobRoleId, string? stage, CancellationToken ct = default);
    Task<CandidateDto> CreateCandidateAsync(Guid managerProfileId, CreateCandidateDto request, CancellationToken ct = default);
    Task<CandidateDto> UpdateCandidateStageAsync(Guid managerProfileId, Guid candidateId, UpdateCandidateDto request, CancellationToken ct = default);
    Task<LearningPlanManagementDto> GetLearningPlanManagementAsync(Guid managerProfileId, string? status, Guid? departmentId, CancellationToken ct = default);
    Task<MessageResponseDto> AssignLearningPlanAsync(Guid managerProfileId, AssignLearningPlanDto request, CancellationToken ct = default);
    Task<PlanTemplateOptionDto> CreateLearningPlanTemplateAsync(Guid managerProfileId, CreateLearningPlanTemplateDto request, CancellationToken ct = default);
    Task<MessageResponseDto> SendTrainingReminderAsync(Guid managerProfileId, SendReminderRequestDto request, CancellationToken ct = default);
    Task<TrainingMonitoringDto> GetTrainingMonitoringAsync(Guid managerProfileId, string? search, Guid? departmentId, string? status, CancellationToken ct = default);
    Task<SkillGapAnalyticsDto> GetSkillGapAnalyticsAsync(Guid managerProfileId, Guid? departmentId, Guid? jobRoleId, Guid? assessmentId, CancellationToken ct = default);
    Task<byte[]> ExportSkillGapAnalysisAsync(Guid managerProfileId, Guid? departmentId, Guid? jobRoleId, CancellationToken ct = default);
    Task<ManagerProfileDto> GetProfileAsync(Guid managerProfileId, CancellationToken ct = default);
    Task<ManagerReportsDto> GetReportsAsync(Guid managerProfileId, CancellationToken ct = default);
    Task<ReportRecordDto> GenerateReportAsync(Guid managerProfileId, GenerateReportRequestDto request, CancellationToken ct = default);
    Task<(byte[] Content, string ContentType, string FileName)> DownloadReportAsync(Guid reportId, CancellationToken ct = default);
    Task<ReportScheduleDto> SaveReportScheduleAsync(Guid managerProfileId, SaveReportScheduleDto request, CancellationToken ct = default);
}
