using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.API.Controllers.v1;

[ApiController]
[Route("api/v1/admin")]
[Authorize(Policy = "RequireAdminRole")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly ICurrentUserService _currentUser;

    public AdminController(IAdminService adminService, ICurrentUserService currentUser)
    {
        _adminService = adminService;
        _currentUser = currentUser;
    }

    [HttpGet("manager-requests")]
    public async Task<ActionResult<List<ManagerRequestDto>>> GetPendingManagerRequests(CancellationToken ct)
    {
        return Ok(await _adminService.GetPendingManagerRequestsAsync(ct));
    }

    [HttpPost("manager-requests/{userId:guid}/approve")]
    public async Task<ActionResult<MessageResponseDto>> ApproveManagerRequest(Guid userId, CancellationToken ct)
    {
        return Ok(await _adminService.ApproveManagerRequestAsync(userId, ct));
    }

    [HttpPost("manager-requests/{userId:guid}/reject")]
    public async Task<ActionResult<MessageResponseDto>> RejectManagerRequest(Guid userId, CancellationToken ct)
    {
        return Ok(await _adminService.RejectManagerRequestAsync(userId, ct));
    }

    [HttpGet("manager-invitations")]
    public async Task<ActionResult<List<ManagerInvitationDto>>> GetInvitations(CancellationToken ct)
    {
        return Ok(await _adminService.GetInvitationsAsync(ct));
    }

    [HttpPost("manager-invitations")]
    public async Task<ActionResult<ManagerInvitationDto>> CreateInvitation(
        [FromBody] CreateManagerInvitationDto request, CancellationToken ct)
    {
        var adminId = _currentUser.UserProfileId
            ?? throw new UnauthorizedDomainException("Invalid admin token.");
        return Ok(await _adminService.CreateInvitationAsync(adminId, request, ct));
    }

    [HttpDelete("manager-invitations/{id:guid}")]
    public async Task<IActionResult> RevokeInvitation(Guid id, CancellationToken ct)
    {
        await _adminService.RevokeInvitationAsync(id, ct);
        return NoContent();
    }
}
