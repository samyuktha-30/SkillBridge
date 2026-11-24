using SkillBridge.Domain.Common;
using SkillBridge.Domain.Enums;

namespace SkillBridge.Domain.Entities;

public class LearningPlan : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public Guid TargetRoleId { get; set; }
    public JobRole TargetRole { get; set; } = null!;
    public bool IsAiGenerated { get; set; }
    public int EstimatedWeeks { get; set; } = 2;
    public string GoalLabel { get; set; } = "Role Readiness";
    public Guid? CreatedByUserProfileId { get; set; }
    public ICollection<LearningModule> Modules { get; set; } = new List<LearningModule>();
}

public class LearningModule : BaseEntity
{
    public Guid LearningPlanId { get; set; }
    public LearningPlan LearningPlan { get; set; } = null!;
    public Guid SkillId { get; set; }
    public Skill Skill { get; set; } = null!;
    public int OrderIndex { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal EstimatedHours { get; set; } = 2.0m;
}

public class EmployeeLearningPlan : BaseEntity
{
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;
    public Guid LearningPlanId { get; set; }
    public LearningPlan LearningPlan { get; set; } = null!;
    public int ProgressPercent { get; set; }
    public DateTime? DueDateUtc { get; set; }
    public Guid? AssignedByManagerProfileId { get; set; }
    public DateTime? LastReminderSentAtUtc { get; set; }
    public ICollection<EmployeeModuleProgress> ModuleProgresses { get; set; } = new List<EmployeeModuleProgress>();
}

public class EmployeeModuleProgress : BaseEntity
{
    public Guid EmployeeLearningPlanId { get; set; }
    public EmployeeLearningPlan EmployeeLearningPlan { get; set; } = null!;
    public Guid LearningModuleId { get; set; }
    public LearningModule LearningModule { get; set; } = null!;
    public ModuleProgressStatus Status { get; set; } = ModuleProgressStatus.NotStarted;
    public DateTime? CompletedAtUtc { get; set; }
}

public class TrainingResource : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string Category { get; set; } = "Programming";
    public ResourceType ResourceType { get; set; } = ResourceType.Course;
    public string Difficulty { get; set; } = "Beginner";
    public string DurationLabel { get; set; } = "2h";
    public string Url { get; set; } = string.Empty;
    public Guid SkillId { get; set; }
    public Skill Skill { get; set; } = null!;
}
