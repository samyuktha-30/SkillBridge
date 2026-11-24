using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.API.Controllers.v1;

[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IEmployeeWorkspaceService _workspaceService;
    private readonly ICurrentUserService _currentUser;

    public NotificationsController(IEmployeeWorkspaceService workspaceService, ICurrentUserService currentUser)
    {
        _workspaceService = workspaceService;
        _currentUser = currentUser;
    }

    private Guid RequireProfileId() =>
        _currentUser.UserProfileId ?? throw new UnauthorizedDomainException("User profile claim is missing.");

    [HttpGet]
    public async Task<ActionResult<PaginatedResultDto<NotificationItemDto>>> GetNotifications(
        [FromQuery] string? category, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
        => Ok(await _workspaceService.GetNotificationsAsync(RequireProfileId(), category, page, pageSize, ct));

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        await _workspaceService.MarkNotificationReadAsync(RequireProfileId(), id, ct);
        return NoContent();
    }
}
