using SkillBridge.Domain.Common;
using SkillBridge.Domain.Enums;

namespace SkillBridge.Domain.Entities;

public class Department : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ICollection<JobRole> JobRoles { get; set; } = new List<JobRole>();
    public ICollection<UserProfile> Users { get; set; } = new List<UserProfile>();
}

public class JobRole : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int TargetScoreThreshold { get; set; } = 80;
    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public ICollection<RoleSkillRequirement> SkillRequirements { get; set; } = new List<RoleSkillRequirement>();
}

public class Skill : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public SkillCategory Category { get; set; } = SkillCategory.Technical;
    public string SubCategory { get; set; } = "Programming";
    public string Description { get; set; } = string.Empty;
}

public class RoleSkillRequirement : BaseEntity
{
    public Guid JobRoleId { get; set; }
    public JobRole JobRole { get; set; } = null!;
    public Guid SkillId { get; set; }
    public Skill Skill { get; set; } = null!;
    public int RequiredLevel { get; set; } = 4; // 1–5 scale
    public decimal Weight { get; set; } = 1.0m;
}

public class EmployeeSkill : BaseEntity
{
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;
    public Guid SkillId { get; set; }
    public Skill Skill { get; set; } = null!;
    public int CurrentLevel { get; set; } // 1–5
    public int TargetLevel { get; set; }  // 1–5
    public int GapScore { get; set; }     // max(0, TargetLevel - CurrentLevel)
    public DateTime? LastAssessedAtUtc { get; set; }
}

public class Assessment : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Category { get; set; } = "Technical";
    public Guid JobRoleId { get; set; }
    public JobRole JobRole { get; set; } = null!;
    public int DurationMinutes { get; set; } = 45;
    public int PassThresholdPercent { get; set; } = 70;
    public DateTime? ScheduledDueDateUtc { get; set; }
    public ICollection<AssessmentQuestion> Questions { get; set; } = new List<AssessmentQuestion>();
}

public class AssessmentQuestion : BaseEntity
{
    public Guid AssessmentId { get; set; }
    public Assessment Assessment { get; set; } = null!;
    public Guid SkillId { get; set; }
    public Skill Skill { get; set; } = null!;
    public string Prompt { get; set; } = string.Empty;
    public string OptionsJson { get; set; } = "[]";
    public int CorrectOptionIndex { get; set; }
    public int Weight { get; set; } = 1;
}

public class AssessmentAttempt : BaseEntity
{
    public Guid AssessmentId { get; set; }
    public Assessment Assessment { get; set; } = null!;
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;
    public AssessmentAttemptStatus Status { get; set; } = AssessmentAttemptStatus.Pending;
    public int? ScorePercent { get; set; }
    public DateTime? StartedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public ICollection<AssessmentAnswer> Answers { get; set; } = new List<AssessmentAnswer>();
}

public class AssessmentAnswer : BaseEntity
{
    public Guid AttemptId { get; set; }
    public AssessmentAttempt Attempt { get; set; } = null!;
    public Guid QuestionId { get; set; }
    public AssessmentQuestion Question { get; set; } = null!;
    public int SelectedOptionIndex { get; set; }
    public bool IsCorrect { get; set; }
}
