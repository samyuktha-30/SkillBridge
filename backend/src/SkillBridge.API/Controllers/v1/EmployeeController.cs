using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.API.Controllers.v1;

[ApiController]
[Route("api/v1/employee")]
[Authorize(Policy = "RequireEmployeeRole")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeWorkspaceService _employeeService;
    private readonly ICurrentUserService _currentUser;

    public EmployeeController(IEmployeeWorkspaceService employeeService, ICurrentUserService currentUser)
    {
        _employeeService = employeeService;
        _currentUser = currentUser;
    }

    private Guid RequireProfileId() =>
        _currentUser.UserProfileId ?? throw new UnauthorizedDomainException("User profile claim is missing.");

    [HttpGet("dashboard")]
    public async Task<ActionResult<EmployeeDashboardDto>> GetDashboard(CancellationToken ct)
        => Ok(await _employeeService.GetDashboardAsync(RequireProfileId(), ct));

    [HttpGet("skills")]
    public async Task<ActionResult<EmployeeSkillsOverviewDto>> GetSkills([FromQuery] string? category, CancellationToken ct)
        => Ok(await _employeeService.GetSkillsAsync(RequireProfileId(), category, ct));

    [HttpPut("target-role")]
    public async Task<ActionResult<UpdateTargetRoleResponseDto>> UpdateTargetRole(
        [FromBody] UpdateTargetRoleDto request, CancellationToken ct)
        => Ok(await _employeeService.UpdateTargetRoleAsync(RequireProfileId(), request, ct));

    [HttpGet("assessments")]
    public async Task<ActionResult<AssessmentsOverviewDto>> GetAssessments(
        [FromQuery] string? status, [FromQuery] string? search, [FromQuery] string? category, CancellationToken ct)
        => Ok(await _employeeService.GetAssessmentsAsync(RequireProfileId(), status, search, category, ct));

    [HttpPost("assessments/{assessmentId:guid}/start")]
    public async Task<ActionResult<AssessmentSessionDto>> StartAssessment(Guid assessmentId, CancellationToken ct)
        => Ok(await _employeeService.StartAssessmentAsync(RequireProfileId(), assessmentId, ct));

    [HttpPost("assessments/{assessmentId:guid}/submit")]
    public async Task<ActionResult<AssessmentResultDto>> SubmitAssessment(
        Guid assessmentId, [FromBody] SubmitAssessmentRequestDto request, CancellationToken ct)
        => Ok(await _employeeService.SubmitAssessmentAsync(RequireProfileId(), assessmentId, request, ct));

    [HttpGet("assessments/attempts/{attemptId:guid}")]
    public async Task<ActionResult<AssessmentResultDto>> GetAssessmentResult(Guid attemptId, CancellationToken ct)
        => Ok(await _employeeService.GetAssessmentResultAsync(RequireProfileId(), attemptId, ct));

    [HttpGet("learning-plan")]
    public async Task<ActionResult<LearningPlanOverviewDto>> GetLearningPlan(CancellationToken ct)
        => Ok(await _employeeService.GetLearningPlanAsync(RequireProfileId(), ct));

    [HttpPost("learning-plan/generate")]
    public async Task<ActionResult<LearningPlanOverviewDto>> GenerateLearningPlan(CancellationToken ct)
        => Ok(await _employeeService.GenerateLearningPlanAsync(RequireProfileId(), ct));

    [HttpPatch("learning-plan/modules/{moduleId:guid}")]
    public async Task<ActionResult<LearningPlanOverviewDto>> UpdateModuleStatus(
        Guid moduleId, [FromBody] UpdateModuleStatusDto request, CancellationToken ct)
        => Ok(await _employeeService.UpdateModuleStatusAsync(RequireProfileId(), moduleId, request, ct));

    [HttpGet("resources")]
    public async Task<ActionResult<ResourcesOverviewDto>> GetResources(
        [FromQuery] string? search, [FromQuery] string? category, [FromQuery] string? resourceType, CancellationToken ct)
        => Ok(await _employeeService.GetResourcesAsync(RequireProfileId(), search, category, resourceType, ct));

    [HttpGet("progress")]
    public async Task<ActionResult<EmployeeProgressDto>> GetProgress([FromQuery] string range = "1M", CancellationToken ct = default)
        => Ok(await _employeeService.GetProgressAsync(RequireProfileId(), range, ct));

    [HttpGet("ai-assistant/session")]
    public async Task<ActionResult<AiChatSessionDto>> GetChatSession([FromQuery] string mode = "Ask a Question", CancellationToken ct = default)
        => Ok(await _employeeService.GetChatSessionAsync(RequireProfileId(), mode, ct));

    [HttpPost("ai-assistant/message")]
    public async Task<ActionResult<SendChatMessageResponseDto>> SendChatMessage(
        [FromBody] SendChatMessageRequestDto request, CancellationToken ct)
        => Ok(await _employeeService.SendChatMessageAsync(RequireProfileId(), request, ct));
}
