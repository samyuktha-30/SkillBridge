using Microsoft.AspNetCore.Identity;
using SkillBridge.Application.Common.Interfaces;

namespace SkillBridge.Infrastructure.Identity;

public class IdentityAuthService : IIdentityAuthService
{
    private readonly UserManager<IdentityUser<Guid>> _userManager;

    public IdentityAuthService(UserManager<IdentityUser<Guid>> userManager)
    {
        _userManager = userManager;
    }

    public async Task<(bool Succeeded, Guid IdentityUserId, string[] Errors)> CreateIdentityUserAsync(
        string email, string password, string roleName, CancellationToken ct = default)
    {
        var user = new IdentityUser<Guid>
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            return (false, Guid.Empty, result.Errors.Select(e => e.Description).ToArray());
        }

        var roleResult = await _userManager.AddToRoleAsync(user, roleName);
        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(user);
            return (false, Guid.Empty, roleResult.Errors.Select(e => e.Description).ToArray());
        }

        return (true, user.Id, Array.Empty<string>());
    }

    public async Task<bool> CheckPasswordAsync(Guid identityUserId, string password, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(identityUserId.ToString());
        if (user == null) return false;
        return await _userManager.CheckPasswordAsync(user, password);
    }

    public async Task<string?> GeneratePasswordResetTokenAsync(string email, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return null;
        return await _userManager.GeneratePasswordResetTokenAsync(user);
    }

    public async Task<(bool Succeeded, string[] Errors)> ResetPasswordAsync(
        string email, string token, string newPassword, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return (false, new[] { "Invalid email or reset token." });
        }

        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        return result.Succeeded
            ? (true, Array.Empty<string>())
            : (false, result.Errors.Select(e => e.Description).ToArray());
    }

    public async Task<(bool Succeeded, string[] Errors)> ChangePasswordAsync(
        Guid identityUserId, string currentPassword, string newPassword, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(identityUserId.ToString());
        if (user == null)
        {
            return (false, new[] { "User account not found." });
        }

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        return result.Succeeded
            ? (true, Array.Empty<string>())
            : (false, result.Errors.Select(e => e.Description).ToArray());
    }

    public async Task DeleteIdentityUserAsync(Guid identityUserId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(identityUserId.ToString());
        if (user != null)
        {
            await _userManager.DeleteAsync(user);
        }
    }
}
