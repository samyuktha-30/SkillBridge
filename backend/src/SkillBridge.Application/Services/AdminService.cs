using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;
using SkillBridge.Domain.Entities;
using SkillBridge.Domain.Enums;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.Application.Services;

public class AdminService : IAdminService
{
    private readonly IApplicationDbContext _db;
    private readonly IJwtTokenService _jwt;

    public AdminService(IApplicationDbContext db, IJwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<List<ManagerRequestDto>> GetPendingManagerRequestsAsync(CancellationToken ct = default)
    {
        return await _db.UserProfiles
            .Where(u => u.Role == UserRole.Manager && u.ApprovalStatus == ApprovalStatus.PendingApproval)
            .OrderByDescending(u => u.CreatedAtUtc)
            .Select(u => new ManagerRequestDto(
                u.Id,
                u.FullName,
                u.Email,
                u.CompanyName,
                u.ApprovalStatus.ToString(),
                u.CreatedAtUtc))
            .ToListAsync(ct);
    }

    public async Task<MessageResponseDto> ApproveManagerRequestAsync(Guid userProfileId, CancellationToken ct = default)
    {
        var profile = await _db.UserProfiles.FirstOrDefaultAsync(u => u.Id == userProfileId, ct)
            ?? throw new NotFoundException(nameof(UserProfile), userProfileId);

        if (profile.Role != UserRole.Manager)
        {
            throw new ValidationDomainException("role", "Only manager registrations can be approved here.");
        }

        profile.ApprovalStatus = ApprovalStatus.Active;
        profile.UpdatedAtUtc = DateTime.UtcNow;

        _db.Notifications.Add(new Notification
        {
            UserProfileId = profile.Id,
            Category = NotificationCategory.System,
            Title = "Manager Access Approved",
            Message = "Your Manager workspace access has been approved by an administrator.",
            ActionLabel = "Open Dashboard",
            ActionRoute = "/manager/dashboard"
        });

        await _db.SaveChangesAsync(ct);
        return new MessageResponseDto($"Approved manager access for {profile.FullName}.");
    }

    public async Task<MessageResponseDto> RejectManagerRequestAsync(Guid userProfileId, CancellationToken ct = default)
    {
        var profile = await _db.UserProfiles.FirstOrDefaultAsync(u => u.Id == userProfileId, ct)
            ?? throw new NotFoundException(nameof(UserProfile), userProfileId);

        profile.ApprovalStatus = ApprovalStatus.Rejected;
        profile.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return new MessageResponseDto($"Rejected manager registration for {profile.FullName}.");
    }

    public async Task<List<ManagerInvitationDto>> GetInvitationsAsync(CancellationToken ct = default)
    {
        return await _db.ManagerInvitations
            .Include(i => i.Department)
            .OrderByDescending(i => i.CreatedAtUtc)
            .Select(i => new ManagerInvitationDto(
                i.Id,
                i.Email,
                i.DisplayCode,
                i.Department != null ? i.Department.Name : null,
                i.ExpiresAtUtc,
                i.AcceptedAtUtc != null,
                i.IsRevoked))
            .ToListAsync(ct);
    }

    public async Task<ManagerInvitationDto> CreateInvitationAsync(Guid adminProfileId, CreateManagerInvitationDto request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(normalizedEmail))
        {
            throw new ValidationDomainException("email", "Manager email is required.");
        }

        Department? dept = null;
        if (request.DepartmentId.HasValue)
        {
            dept = await _db.Departments.FirstOrDefaultAsync(d => d.Id == request.DepartmentId.Value, ct)
                ?? throw new NotFoundException(nameof(Department), request.DepartmentId.Value);
        }

        var rawCode = GenerateInviteCode();
        var hash = _jwt.HashToken(rawCode);
        var expiresAt = DateTime.UtcNow.AddDays(Math.Clamp(request.ExpiresInDays, 1, 30));

        var invitation = new ManagerInvitation
        {
            Email = normalizedEmail,
            TokenHash = hash,
            DisplayCode = rawCode,
            DepartmentId = dept?.Id,
            IssuedByUserProfileId = adminProfileId,
            ExpiresAtUtc = expiresAt
        };

        _db.ManagerInvitations.Add(invitation);
        await _db.SaveChangesAsync(ct);

        return new ManagerInvitationDto(
            invitation.Id,
            invitation.Email,
            rawCode,
            dept?.Name,
            invitation.ExpiresAtUtc,
            false,
            false);
    }

    public async Task RevokeInvitationAsync(Guid invitationId, CancellationToken ct = default)
    {
        var invitation = await _db.ManagerInvitations.FirstOrDefaultAsync(i => i.Id == invitationId, ct)
            ?? throw new NotFoundException(nameof(ManagerInvitation), invitationId);

        invitation.IsRevoked = true;
        invitation.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    private static string GenerateInviteCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Span<char> buffer = stackalloc char[10];
        for (int i = 0; i < buffer.Length; i++)
        {
            buffer[i] = chars[RandomNumberGenerator.GetInt32(chars.Length)];
        }
        return $"MGR-{new string(buffer[..5])}-{new string(buffer[5..])}";
    }
}
