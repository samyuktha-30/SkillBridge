using SkillBridge.Domain.Common;
using SkillBridge.Domain.Enums;

namespace SkillBridge.Domain.Entities;

public class Candidate : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Guid JobRoleId { get; set; }
    public JobRole JobRole { get; set; } = null!;
    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public CandidateStage Stage { get; set; } = CandidateStage.Screening;
    public int? SkillScorePercent { get; set; }
    public DateTime? NextFollowUpDateUtc { get; set; }
    public string? Notes { get; set; }
    public Guid ManagedByUserProfileId { get; set; }
}

public class Notification : BaseEntity
{
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;
    public NotificationCategory Category { get; set; } = NotificationCategory.System;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionLabel { get; set; }
    public string? ActionRoute { get; set; }
    public bool IsRead { get; set; }
}

public class AiChatSession : BaseEntity
{
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;
    public string Mode { get; set; } = "Ask a Question";
    public ICollection<AiChatMessage> Messages { get; set; } = new List<AiChatMessage>();
}

public class AiChatMessage : BaseEntity
{
    public Guid AiChatSessionId { get; set; }
    public AiChatSession Session { get; set; } = null!;
    public string Sender { get; set; } = "User"; // User or Assistant
    public string Content { get; set; } = string.Empty;
    public string? CodeSnippet { get; set; }
}

public class Achievement : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class EmployeeAchievement : BaseEntity
{
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;
    public Guid AchievementId { get; set; }
    public Achievement Achievement { get; set; } = null!;
    public DateTime UnlockedAtUtc { get; set; } = DateTime.UtcNow;
}

public class ReportRecord : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string ReportType { get; set; } = "Skill gap summary";
    public string DepartmentName { get; set; } = "All departments";
    public string Format { get; set; } = "CSV"; // CSV or PDF
    public string FileName { get; set; } = string.Empty;
    public byte[] FileContent { get; set; } = Array.Empty<byte>();
    public string CreatedByName { get; set; } = string.Empty;
    public Guid CreatedByUserProfileId { get; set; }
}

public class ReportSchedule : BaseEntity
{
    public Guid ManagerUserProfileId { get; set; }
    public string ReportType { get; set; } = "Skill gap summary";
    public string FrequencyCron { get; set; } = "0 9 1 * *";
    public string RecipientEmail { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class ActivityLog : BaseEntity
{
    public Guid UserProfileId { get; set; }
    public string ActorName { get; set; } = string.Empty;
    public string Category { get; set; } = "Assessment";
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
}
