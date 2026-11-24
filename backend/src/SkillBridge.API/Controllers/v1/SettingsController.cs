using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.API.Controllers.v1;

[ApiController]
[Route("api/v1/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly IEmployeeWorkspaceService _workspaceService;
    private readonly ICurrentUserService _currentUser;

    public SettingsController(IEmployeeWorkspaceService workspaceService, ICurrentUserService currentUser)
    {
        _workspaceService = workspaceService;
        _currentUser = currentUser;
    }

    private Guid RequireProfileId() =>
        _currentUser.UserProfileId ?? throw new UnauthorizedDomainException("User profile claim is missing.");

    private Guid RequireIdentityId() =>
        _currentUser.IdentityUserId ?? throw new UnauthorizedDomainException("Identity user claim is missing.");

    [HttpGet]
    public async Task<ActionResult<UserSettingsDto>> GetSettings(CancellationToken ct)
        => Ok(await _workspaceService.GetSettingsAsync(RequireProfileId(), ct));

    [HttpPut("profile")]
    public async Task<ActionResult<UserSettingsDto>> UpdateProfile(
        [FromBody] UpdateProfileRequestDto request, CancellationToken ct)
        => Ok(await _workspaceService.UpdateProfileAsync(RequireProfileId(), request, ct));

    [HttpPut]
    public async Task<ActionResult<UserSettingsDto>> UpdateSettings(
        [FromBody] UpdateSettingsRequestDto request, CancellationToken ct)
        => Ok(await _workspaceService.UpdateSettingsAsync(RequireProfileId(), request, ct));

    [HttpPost("change-password")]
    public async Task<ActionResult<MessageResponseDto>> ChangePassword(
        [FromBody] ChangePasswordRequestDto request, CancellationToken ct)
        => Ok(await _workspaceService.ChangePasswordAsync(RequireIdentityId(), request, ct));

    [HttpGet("sessions")]
    public async Task<ActionResult<List<ActiveSessionDto>>> GetActiveSessions(CancellationToken ct)
        => Ok(await _workspaceService.GetActiveSessionsAsync(RequireProfileId(), ct));

    [HttpGet("export-data")]
    public async Task<IActionResult> ExportMyData(CancellationToken ct)
    {
        var bytes = await _workspaceService.ExportMyDataAsync(RequireProfileId(), ct);
        return File(bytes, "application/json", "skillbridge-my-data.json");
    }

    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount(CancellationToken ct)
    {
        await _workspaceService.DeleteAccountAsync(RequireProfileId(), ct);
        return NoContent();
    }
}
