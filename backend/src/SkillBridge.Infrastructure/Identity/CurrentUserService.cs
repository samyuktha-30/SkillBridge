using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Domain.Enums;

namespace SkillBridge.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? IdentityUserId
    {
        get
        {
            var raw = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(raw, out var id) ? id : null;
        }
    }

    public Guid? UserProfileId
    {
        get
        {
            var raw = _httpContextAccessor.HttpContext?.User?.FindFirstValue("profile_id");
            return Guid.TryParse(raw, out var id) ? id : null;
        }
    }

    public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);

    public UserRole? Role
    {
        get
        {
            var raw = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
            return Enum.TryParse<UserRole>(raw, true, out var role) ? role : null;
        }
    }
}
