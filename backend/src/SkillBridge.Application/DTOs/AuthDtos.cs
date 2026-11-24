namespace SkillBridge.Application.DTOs;

public record AuthUserDto(
    Guid Id,
    string FullName,
    string Email,
    string EmployeeCode,
    string AvatarInitials,
    string Role,
    string ApprovalStatus,
    string? JobTitle,
    Guid? DepartmentId,
    string? DepartmentName,
    Guid? TargetRoleId,
    string? TargetRoleTitle,
    string BatchLabel,
    string? PhoneNumber,
    string? Location,
    string? CompanyName,
    bool TwoFactorEnabled);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAtUtc,
    AuthUserDto User);

public record LoginRequestDto(
    string Email,
    string Password,
    string? ExpectedRole,
    bool RememberMe = true);

public record EmployeeRegisterRequestDto(
    string FullName,
    string Email,
    string Password,
    string? CompanyName);

public record ManagerRegisterRequestDto(
    string FullName,
    string Email,
    string Password,
    string? CompanyName,
    string? InvitationCode);

public record ManagerRegisterResultDto(
    bool RequiresAdminApproval,
    string Message,
    AuthResponseDto? Auth);

public record RefreshTokenRequestDto(string RefreshToken);
public record LogoutRequestDto(string? RefreshToken);
public record ForgotPasswordRequestDto(string Email);
public record ForgotPasswordResponseDto(string Message, string? ResetTokenPreview = null);
public record ResetPasswordRequestDto(string Email, string Token, string NewPassword);
public record ChangePasswordRequestDto(string CurrentPassword, string NewPassword);
public record MessageResponseDto(string Message);

public record CreateManagerInvitationDto(string Email, Guid? DepartmentId, int ExpiresInDays = 7);
public record ManagerInvitationDto(Guid Id, string Email, string InvitationCode, string? DepartmentName, DateTime ExpiresAtUtc, bool IsUsed, bool IsRevoked);
public record ManagerRequestDto(Guid Id, string FullName, string Email, string? CompanyName, string ApprovalStatus, DateTime CreatedAtUtc);

public record DepartmentOptionDto(Guid Id, string Name, string Description);
public record JobRoleOptionDto(Guid Id, string Title, Guid DepartmentId, string DepartmentName, string Description);
