using SkillBridge.Domain.Common;
using SkillBridge.Domain.Enums;

namespace SkillBridge.Domain.Entities;

public class UserProfile : BaseEntity
{
    public Guid IdentityUserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string AvatarInitials { get; set; } = "SB";
    public string BatchLabel { get; set; } = "Active Cohort";
    public string? CompanyName { get; set; }
    public string? JobTitle { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Location { get; set; }
    public UserRole Role { get; set; } = UserRole.Employee;
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Active;
    public bool TwoFactorEnabled { get; set; }

    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public Guid? TargetRoleId { get; set; }
    public JobRole? TargetRole { get; set; }

    public Guid? ManagerProfileId { get; set; }
    public UserProfile? ManagerProfile { get; set; }

    public UserSettings? Settings { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<EmployeeSkill> EmployeeSkills { get; set; } = new List<EmployeeSkill>();
    public ICollection<AssessmentAttempt> AssessmentAttempts { get; set; } = new List<AssessmentAttempt>();
    public ICollection<EmployeeLearningPlan> LearningPlans { get; set; } = new List<EmployeeLearningPlan>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

public class RefreshToken : BaseEntity
{
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;

    public string TokenHash { get; set; } = string.Empty;
    public Guid FamilyId { get; set; } = Guid.NewGuid();
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public string? ReplacedByTokenHash { get; set; }
    public bool IsActive => RevokedAtUtc == null && DateTime.UtcNow < ExpiresAtUtc;
}

public class ManagerInvitation : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;
    public string DisplayCode { get; set; } = string.Empty;
    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }
    public Guid IssuedByUserProfileId { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? AcceptedAtUtc { get; set; }
    public bool IsRevoked { get; set; }
}

public class UserSettings : BaseEntity
{
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;

    public bool AssessmentReminders { get; set; } = true;
    public bool LearningPlanUpdates { get; set; } = true;
    public bool TrainingDeadlineAlerts { get; set; } = true;
    public bool SystemAnnouncements { get; set; } = false;
    public bool EmailNotifications { get; set; } = true;
    public bool MonthlyReportDelivery { get; set; } = true;
    public string Theme { get; set; } = "Light";
    public string Language { get; set; } = "English";
    public string TimeZone { get; set; } = "IST (UTC +5:30)";
    public string DefaultTeamView { get; set; } = "All departments";
}
