using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.API.Controllers.v1;

[ApiController]
[Route("api/v1/manager")]
[Authorize(Policy = "RequireManagerRole")]
public class ManagerController : ControllerBase
{
    private readonly IManagerWorkspaceService _managerService;
    private readonly ICurrentUserService _currentUser;

    public ManagerController(IManagerWorkspaceService managerService, ICurrentUserService currentUser)
    {
        _managerService = managerService;
        _currentUser = currentUser;
    }

    private Guid RequireProfileId() =>
        _currentUser.UserProfileId ?? throw new UnauthorizedDomainException("Manager profile claim is missing.");

      [HttpGet("employee-approvals")]
public async Task<ActionResult<EmployeeAccessListDto>> GetEmployeeApprovals(
    CancellationToken ct)
    => Ok(await _managerService.GetEmployeeApprovalsAsync(RequireProfileId(), ct));

[HttpPut("employees/{employeeId:guid}/approval")]
public async Task<ActionResult<MessageResponseDto>> UpdateEmployeeApproval(
    Guid employeeId,
    [FromBody] UpdateEmployeeApprovalDto request,
    CancellationToken ct)
    => Ok(await _managerService.UpdateEmployeeApprovalAsync(
        RequireProfileId(), employeeId, request, ct));

    [HttpGet("dashboard")]
    public async Task<ActionResult<ManagerDashboardDto>> GetDashboard(CancellationToken ct)
        => Ok(await _managerService.GetDashboardAsync(RequireProfileId(), ct));

    [HttpGet("candidates")]
    public async Task<ActionResult<CandidatesOverviewDto>> GetCandidates(
        [FromQuery] string? search, [FromQuery] Guid? jobRoleId, [FromQuery] string? stage, CancellationToken ct)
        => Ok(await _managerService.GetCandidatesAsync(RequireProfileId(), search, jobRoleId, stage, ct));

    [HttpPost("candidates")]
    public async Task<ActionResult<CandidateDto>> CreateCandidate(
        [FromBody] CreateCandidateDto request, CancellationToken ct)
        => Ok(await _managerService.CreateCandidateAsync(RequireProfileId(), request, ct));

    [HttpPut("candidates/{id:guid}")]
    public async Task<ActionResult<CandidateDto>> UpdateCandidateStage(
        Guid id, [FromBody] UpdateCandidateDto request, CancellationToken ct)
        => Ok(await _managerService.UpdateCandidateStageAsync(RequireProfileId(), id, request, ct));

    [HttpGet("learning-plans")]
    public async Task<ActionResult<LearningPlanManagementDto>> GetLearningPlanManagement(
        [FromQuery] string? status, [FromQuery] Guid? departmentId, CancellationToken ct)
        => Ok(await _managerService.GetLearningPlanManagementAsync(RequireProfileId(), status, departmentId, ct));

    [HttpPost("learning-plans/assign")]
    public async Task<ActionResult<MessageResponseDto>> AssignLearningPlan(
        [FromBody] AssignLearningPlanDto request, CancellationToken ct)
        => Ok(await _managerService.AssignLearningPlanAsync(RequireProfileId(), request, ct));

    [HttpPost("learning-plans/templates")]
    public async Task<ActionResult<PlanTemplateOptionDto>> CreateLearningPlanTemplate(
        [FromBody] CreateLearningPlanTemplateDto request, CancellationToken ct)
        => Ok(await _managerService.CreateLearningPlanTemplateAsync(RequireProfileId(), request, ct));

    [HttpPost("training-monitoring/remind")]
    public async Task<ActionResult<MessageResponseDto>> SendTrainingReminder(
        [FromBody] SendReminderRequestDto request, CancellationToken ct)
        => Ok(await _managerService.SendTrainingReminderAsync(RequireProfileId(), request, ct));

    [HttpGet("training-monitoring")]
    public async Task<ActionResult<TrainingMonitoringDto>> GetTrainingMonitoring(
        [FromQuery] string? search, [FromQuery] Guid? departmentId, [FromQuery] string? status, CancellationToken ct)
        => Ok(await _managerService.GetTrainingMonitoringAsync(RequireProfileId(), search, departmentId, status, ct));

    [HttpGet("skill-gap-analytics")]
    public async Task<ActionResult<SkillGapAnalyticsDto>> GetSkillGapAnalytics(
        [FromQuery] Guid? departmentId, [FromQuery] Guid? jobRoleId, [FromQuery] Guid? assessmentId, CancellationToken ct)
        => Ok(await _managerService.GetSkillGapAnalyticsAsync(RequireProfileId(), departmentId, jobRoleId, assessmentId, ct));

    [HttpGet("skill-gap-analytics/export")]
    public async Task<IActionResult> ExportSkillGapAnalysis(
        [FromQuery] Guid? departmentId, [FromQuery] Guid? jobRoleId, CancellationToken ct)
    {
        var csv = await _managerService.ExportSkillGapAnalysisAsync(RequireProfileId(), departmentId, jobRoleId, ct);
        return File(csv, "text/csv; charset=utf-8", "skillbridge-skill-gaps.csv");
    }

    [HttpGet("profile")]
    public async Task<ActionResult<ManagerProfileDto>> GetProfile(CancellationToken ct)
        => Ok(await _managerService.GetProfileAsync(RequireProfileId(), ct));

    [HttpGet("reports")]
    public async Task<ActionResult<ManagerReportsDto>> GetReports(CancellationToken ct)
        => Ok(await _managerService.GetReportsAsync(RequireProfileId(), ct));

    [HttpPost("reports")]
    public async Task<ActionResult<ReportRecordDto>> GenerateReport(
        [FromBody] GenerateReportRequestDto request, CancellationToken ct)
        => Ok(await _managerService.GenerateReportAsync(RequireProfileId(), request, ct));

    [HttpGet("reports/{reportId:guid}/download")]
    public async Task<IActionResult> DownloadReport(Guid reportId, CancellationToken ct)
    {
        var (content, contentType, fileName) = await _managerService.DownloadReportAsync(reportId, ct);
        return File(content, contentType, fileName);
    }

    [HttpPut("reports/schedule")]
    public async Task<ActionResult<ReportScheduleDto>> SaveReportSchedule(
        [FromBody] SaveReportScheduleDto request, CancellationToken ct)
        => Ok(await _managerService.SaveReportScheduleAsync(RequireProfileId(), request, ct));
}
