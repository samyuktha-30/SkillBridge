using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;
using SkillBridge.Domain.Entities;
using SkillBridge.Domain.Enums;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _db;
    private readonly IIdentityAuthService _identity;
    private readonly IJwtTokenService _jwt;
    private readonly IConfiguration _config;

    public AuthService(
        IApplicationDbContext db,
        IIdentityAuthService identity,
        IJwtTokenService jwt,
        IConfiguration config)
    {
        _db = db;
        _identity = identity;
        _jwt = jwt;
        _config = config;
    }

public async Task<MessageResponseDto> RegisterEmployeeAsync(
    EmployeeRegisterRequestDto request,
    CancellationToken ct = default)
{
    var normalizedEmail = request.Email.Trim().ToLowerInvariant();

    if (await _db.UserProfiles.AnyAsync(
        u => u.Email.ToLower() == normalizedEmail, ct))
    {
        throw new ValidationDomainException(
            "email",
            "An account with this email already exists.");
    }

    var (succeeded, identityUserId, errors) =
        await _identity.CreateIdentityUserAsync(
            normalizedEmail,
            request.Password,
            UserRole.Employee.ToString(),
            ct);

    if (!succeeded)
    {
        throw new ValidationDomainException(
            "password",
            string.Join(" ", errors));
    }

    var defaultDept = await _db.Departments
        .OrderBy(d => d.Name)
        .FirstOrDefaultAsync(ct);

    var defaultRole = await _db.JobRoles
        .OrderBy(r => r.Title)
        .FirstOrDefaultAsync(ct);

    var profile = new UserProfile
    {
        IdentityUserId = identityUserId,
        FullName = request.FullName.Trim(),
        Email = normalizedEmail,
        EmployeeCode = GenerateEmployeeCode("EMP"),
        AvatarInitials = ComputeInitials(request.FullName),
        BatchLabel = $"Cohort {DateTime.UtcNow:yyyy}",
        CompanyName = request.CompanyName?.Trim(),
        JobTitle = defaultRole?.Title ?? "Associate",
        Role = UserRole.Employee,

        // Employee must wait for manager approval.
        ApprovalStatus = ApprovalStatus.PendingApproval,

        DepartmentId = defaultDept?.Id,
        Department = defaultDept,
        TargetRoleId = defaultRole?.Id,
        TargetRole = defaultRole
    };

    _db.UserProfiles.Add(profile);
    _db.UserSettings.Add(
        new UserSettings { UserProfileId = profile.Id });

    await _db.SaveChangesAsync(ct);

    // Do not issue access or refresh tokens before approval.
    return new MessageResponseDto(
        "Your registration is successful. Your account is awaiting manager approval. Please wait for approval before signing in.");
}


    public async Task<ManagerRegisterResultDto> RegisterManagerAsync(ManagerRegisterRequestDto request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        if (await _db.UserProfiles.AnyAsync(u => u.Email.ToLower() == normalizedEmail, ct))
        {
            throw new ValidationDomainException("email", "An account with this email already exists.");
        }

        ManagerInvitation? validInvitation = null;
        if (!string.IsNullOrWhiteSpace(request.InvitationCode))
        {
            var codeHash = _jwt.HashToken(request.InvitationCode.Trim().ToUpperInvariant());
            validInvitation = await _db.ManagerInvitations
                .Include(i => i.Department)
                .FirstOrDefaultAsync(i => i.TokenHash == codeHash, ct);

            if (validInvitation == null || validInvitation.IsRevoked || validInvitation.AcceptedAtUtc != null || validInvitation.ExpiresAtUtc <= DateTime.UtcNow)
            {
                throw new ValidationDomainException("invitationCode", "The provided manager invitation code is invalid, expired, or already used.");
            }

            if (!string.Equals(validInvitation.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase))
            {
                throw new ValidationDomainException("invitationCode", "This invitation code was issued for a different email address.");
            }
        }

        var (succeeded, identityUserId, errors) = await _identity.CreateIdentityUserAsync(
            normalizedEmail, request.Password, UserRole.Manager.ToString(), ct);

        if (!succeeded)
        {
            throw new ValidationDomainException("password", string.Join(" ", errors));
        }

        var dept = validInvitation?.Department
            ?? await _db.Departments.OrderBy(d => d.Name).FirstOrDefaultAsync(ct);

        var isApprovedViaInvite = validInvitation != null;
        var profile = new UserProfile
        {
            IdentityUserId = identityUserId,
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            EmployeeCode = GenerateEmployeeCode("MGR"),
            AvatarInitials = ComputeInitials(request.FullName),
            BatchLabel = "Leadership",
            CompanyName = request.CompanyName?.Trim(),
            JobTitle = "Engineering Manager",
            Role = UserRole.Manager,
            ApprovalStatus = isApprovedViaInvite ? ApprovalStatus.Active : ApprovalStatus.PendingApproval,
            DepartmentId = dept?.Id,
            Department = dept
        };

        _db.UserProfiles.Add(profile);
        _db.UserSettings.Add(new UserSettings { UserProfileId = profile.Id });

        if (validInvitation != null)
        {
            validInvitation.AcceptedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
            var auth = await IssueAuthResponseAsync(profile, ct);
            return new ManagerRegisterResultDto(false, "Manager account activated via verified invitation.", auth);
        }

        await _db.SaveChangesAsync(ct);
        return new ManagerRegisterResultDto(
            true,
            "Registration submitted. An administrator must approve your Manager account before you can sign in.",
            null);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var profile = await _db.UserProfiles
            .Include(u => u.Department)
            .Include(u => u.TargetRole)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, ct);

        if (profile == null)
        {
            throw new UnauthorizedDomainException("Invalid email or password.");
        }

        var passwordValid = await _identity.CheckPasswordAsync(profile.IdentityUserId, request.Password, ct);
        if (profile.Role == UserRole.Employee &&
    profile.ApprovalStatus != ApprovalStatus.Active)
{
    throw new ForbiddenDomainException(
        "Your account is awaiting manager approval.");
}

if (profile.Role == UserRole.Manager &&
    profile.ApprovalStatus == ApprovalStatus.PendingApproval)
{
    throw new ForbiddenDomainException(
        "Your manager account is pending administrator approval.");
}

if (profile.Role == UserRole.Manager &&
    profile.ApprovalStatus == ApprovalStatus.Rejected)
{
    throw new ForbiddenDomainException(
        "Your manager registration request was declined by an administrator.");
}

        if (!string.IsNullOrWhiteSpace(request.ExpectedRole))
        {
            var expected = request.ExpectedRole.Trim();
            var roleName = profile.Role.ToString();
            if (string.Equals(expected, "Employee", StringComparison.OrdinalIgnoreCase) && profile.Role != UserRole.Employee)
            {
                throw new ForbiddenDomainException("Please use the Manager Login portal for Manager or Admin accounts.");
            }
            if (string.Equals(expected, "Manager", StringComparison.OrdinalIgnoreCase) && profile.Role == UserRole.Employee)
            {
                throw new ForbiddenDomainException("Employee accounts must sign in through the Employee Login portal.");
            }
            _ = roleName;
        }

        return await IssueAuthResponseAsync(profile, ct);
    }

    public async Task<AuthResponseDto> RefreshAsync(RefreshTokenRequestDto request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            throw new UnauthorizedDomainException("Refresh token is required.");
        }

        var incomingHash = _jwt.HashToken(request.RefreshToken.Trim());
        var tokenRecord = await _db.RefreshTokens
            .Include(r => r.UserProfile)
                .ThenInclude(u => u.Department)
            .Include(r => r.UserProfile)
                .ThenInclude(u => u.TargetRole)
            .FirstOrDefaultAsync(r => r.TokenHash == incomingHash, ct);

        if (tokenRecord == null)
        {
            throw new UnauthorizedDomainException("Invalid refresh token.");
        }

        // Reuse detection: if a rotated/revoked token is replayed, revoke the entire token family.
        if (tokenRecord.RevokedAtUtc != null)
        {
            var familyTokens = await _db.RefreshTokens
                .Where(r => r.FamilyId == tokenRecord.FamilyId && r.RevokedAtUtc == null)
                .ToListAsync(ct);

            foreach (var t in familyTokens)
            {
                t.RevokedAtUtc = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync(ct);
            throw new UnauthorizedDomainException("Refresh token reuse detected. Session family revoked.");
        }

        if (tokenRecord.ExpiresAtUtc <= DateTime.UtcNow)
        {
            tokenRecord.RevokedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
            throw new UnauthorizedDomainException("Refresh token has expired.");
        }

        if (tokenRecord.UserProfile.ApprovalStatus != ApprovalStatus.Active)
        {
            throw new ForbiddenDomainException("Account is not active.");
        }

        var rawNewRefresh = _jwt.GenerateOpaqueRefreshToken();
        var newHash = _jwt.HashToken(rawNewRefresh);
        var refreshDays = int.TryParse(_config["Jwt:RefreshTokenDays"], out var days) ? days : 14;

        tokenRecord.RevokedAtUtc = DateTime.UtcNow;
        tokenRecord.ReplacedByTokenHash = newHash;

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserProfileId = tokenRecord.UserProfileId,
            TokenHash = newHash,
            FamilyId = tokenRecord.FamilyId,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(refreshDays)
        });

        await _db.SaveChangesAsync(ct);

        var (accessToken, expiresAtUtc) = _jwt.GenerateAccessToken(tokenRecord.UserProfile);
        return new AuthResponseDto(accessToken, rawNewRefresh, expiresAtUtc, MapUserDto(tokenRecord.UserProfile));
    }

    public async Task LogoutAsync(Guid? userProfileId, string? refreshToken, CancellationToken ct = default)
    {
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            var hash = _jwt.HashToken(refreshToken.Trim());
            var token = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == hash, ct);
            if (token != null && token.RevokedAtUtc == null)
            {
                token.RevokedAtUtc = DateTime.UtcNow;
                await _db.SaveChangesAsync(ct);
                return;
            }
        }

        if (userProfileId.HasValue)
        {
            var activeTokens = await _db.RefreshTokens
                .Where(r => r.UserProfileId == userProfileId.Value && r.RevokedAtUtc == null)
                .ToListAsync(ct);
            foreach (var t in activeTokens)
            {
                t.RevokedAtUtc = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task<ForgotPasswordResponseDto> ForgotPasswordAsync(ForgotPasswordRequestDto request, CancellationToken ct = default)
    {
        var token = await _identity.GeneratePasswordResetTokenAsync(request.Email.Trim(), ct);
        var includePreview = bool.TryParse(_config["Features:IncludeResetTokenPreview"], out var preview) && preview;

        return new ForgotPasswordResponseDto(
            "If an account exists for that email address, password reset instructions have been generated.",
            includePreview ? token : null);
    }

    public async Task<MessageResponseDto> ResetPasswordAsync(ResetPasswordRequestDto request, CancellationToken ct = default)
    {
        var (succeeded, errors) = await _identity.ResetPasswordAsync(request.Email.Trim(), request.Token.Trim(), request.NewPassword, ct);
        if (!succeeded)
        {
            throw new ValidationDomainException("token", string.Join(" ", errors));
        }

        return new MessageResponseDto("Your password has been updated. You can now sign in with your new credentials.");
    }

    private async Task<AuthResponseDto> IssueAuthResponseAsync(UserProfile profile, CancellationToken ct)
    {
        var (accessToken, expiresAtUtc) = _jwt.GenerateAccessToken(profile);
        var rawRefresh = _jwt.GenerateOpaqueRefreshToken();
        var refreshHash = _jwt.HashToken(rawRefresh);
        var refreshDays = int.TryParse(_config["Jwt:RefreshTokenDays"], out var days) ? days : 14;

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserProfileId = profile.Id,
            TokenHash = refreshHash,
            FamilyId = Guid.NewGuid(),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(refreshDays)
        });

        await _db.SaveChangesAsync(ct);
        return new AuthResponseDto(accessToken, rawRefresh, expiresAtUtc, MapUserDto(profile));
    }

    public static AuthUserDto MapUserDto(UserProfile profile)
    {
        return new AuthUserDto(
            profile.Id,
            profile.FullName,
            profile.Email,
            profile.EmployeeCode,
            profile.AvatarInitials,
            profile.Role.ToString(),
            profile.ApprovalStatus.ToString(),
            profile.JobTitle,
            profile.DepartmentId,
            profile.Department?.Name,
            profile.TargetRoleId,
            profile.TargetRole?.Title,
            profile.BatchLabel,
            profile.PhoneNumber,
            profile.Location,
            profile.CompanyName,
            profile.TwoFactorEnabled);
    }

    private static string GenerateEmployeeCode(string prefix)
    {
        var num = RandomNumberGenerator.GetInt32(1000, 9999);
        return $"{prefix}-{num}";
    }

    private static string ComputeInitials(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Length == 0) return "SB";
        if (parts.Length == 1) return parts[0][..Math.Min(2, parts[0].Length)].ToUpperInvariant();
        return $"{char.ToUpperInvariant(parts[0][0])}{char.ToUpperInvariant(parts[^1][0])}";
    }
}
