using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;

namespace SkillBridge.API.Controllers.v1;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUser;

    public AuthController(IAuthService authService, ICurrentUserService currentUser)
    {
        _authService = authService;
        _currentUser = currentUser;
    }

    [HttpPost("register/employee")]
[AllowAnonymous]
[ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
public async Task<ActionResult<MessageResponseDto>> RegisterEmployee(
    [FromBody] EmployeeRegisterRequestDto request, CancellationToken ct)
{
    return Ok(await _authService.RegisterEmployeeAsync(request, ct));
}

    [HttpPost("register/manager")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ManagerRegisterResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ManagerRegisterResultDto>> RegisterManager(
        [FromBody] ManagerRegisterRequestDto request, CancellationToken ct)
    {
        return Ok(await _authService.RegisterManagerAsync(request, ct));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AuthResponseDto>> Login(
        [FromBody] LoginRequestDto request, CancellationToken ct)
    {
        return Ok(await _authService.LoginAsync(request, ct));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AuthResponseDto>> Refresh(
        [FromBody] RefreshTokenRequestDto request, CancellationToken ct)
    {
        return Ok(await _authService.RefreshAsync(request, ct));
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout([FromBody] LogoutRequestDto? request, CancellationToken ct)
    {
        await _authService.LogoutAsync(_currentUser.UserProfileId, request?.RefreshToken, ct);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ForgotPasswordResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ForgotPasswordResponseDto>> ForgotPassword(
        [FromBody] ForgotPasswordRequestDto request, CancellationToken ct)
    {
        return Ok(await _authService.ForgotPasswordAsync(request, ct));
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<MessageResponseDto>> ResetPassword(
        [FromBody] ResetPasswordRequestDto request, CancellationToken ct)
    {
        return Ok(await _authService.ResetPasswordAsync(request, ct));
    }
}
