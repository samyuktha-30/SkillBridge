using System.ComponentModel.DataAnnotations;

namespace SkillBridge.Models;

public sealed class ManagerProfileViewModel
{
    [Required(ErrorMessage = "Enter your full name.")]
    [StringLength(100)]
    public string FullName { get; set; } = "";

    [Required(ErrorMessage = "Enter your email address.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    [StringLength(254)]
    public string Email { get; set; } = "";

    [Phone(ErrorMessage = "Enter a valid phone number.")]
    [StringLength(30)]
    public string? PhoneNumber { get; set; }

    [Required(ErrorMessage = "Enter your department.")]
    [StringLength(100)]
    public string Department { get; set; } = "";

    [Required(ErrorMessage = "Enter your job role.")]
    [StringLength(100)]
    public string JobRole { get; set; } = "";

    public string EmployeeId { get; set; } = "";
    public string AccountRole { get; set; } = "Manager";
    public string AccountStatus { get; set; } = "Active";
    public int ManagedEmployeeCount { get; set; }
    public int AssessedEmployeeCount { get; set; }
    public int EmployeesWithSkillGaps { get; set; }
    public string ManagedDepartments { get; set; } = "";

    public string ProfileSummary => string.Join(" · ", new[] { JobRole, Department }
        .Where(value => !string.IsNullOrWhiteSpace(value)));
}

public record Skill(string Name, string Code, int Level, int Max, bool Met)
{
    public int Percent => (int)Math.Round(Level * 100.0 / Max);
}

public record AssessmentItem(
    string Title,
    string Subtitle,
    string MetaLabel,
    string MetaValue,
    string Status,
    string Action,
    string? Score = null,
    string? Icon = "clipboard-list");

public record RoadmapModule(string Title, string Subtitle, string Duration, string State, bool Highlighted = false);

public record LearningResource(
    string Title,
    string Description,
    string Kind,
    string Duration,
    string Level,
    string Category,
    string Action);

public record NotificationItem(string Title, string Body, string Time, string Kind, bool Unread)
{
    public string Icon => Kind switch
    {
        "assessment" => "clipboard-list",
        "learning" => "trophy",
        "system" => "bell",
        "reminder" => "clock",
        _ => "bell"
    };
}

public record Candidate(
    string Name,
    string Role,
    string Department,
    string Stage,
    string Score,
    string FollowUp,
    string Initials,
    string AvatarTone);

public record EmployeePlan(
    string Employee,
    string Plan,
    string Completed,
    string Progress,
    string DueDate,
    string Status,
    string Initials,
    string AvatarTone,
    string? Id = null,
    string Role = "",
    string Department = "");

public record ReportRow(
    string Name,
    string Department,
    string GeneratedOn,
    string CreatedBy,
    string Format,
    string Action,
    string Id,
    string Category,
    string ReportingPeriod,
    string Status);

public record ManagerReportSkillRow(
    string Employee,
    string Department,
    string Skill,
    int? CurrentLevel,
    int? RequiredLevel)
{
    public int? Gap => CurrentLevel.HasValue && RequiredLevel.HasValue
        ? Math.Max(0, RequiredLevel.Value - CurrentLevel.Value)
        : null;
}

public record ManagerReportTrainingRow(
    string Employee,
    string Course,
    string SkillCategory,
    int ProgressPercent,
    string Status,
    string TargetCompletionDate);

public record ManagerReportEmployeeRow(
    string Name,
    string Department,
    int SkillsAssessed,
    string AssessmentResults,
    int TrainingProgressPercent,
    string TrainingStatus);

public record ManagerReportInsight(string Title, string Detail);

public record ManagerReportDetail(
    ReportRow Report,
    IReadOnlyList<ManagerReportSkillRow> SkillProficiency,
    IReadOnlyList<ManagerReportTrainingRow> TrainingPrograms,
    IReadOnlyList<ManagerReportEmployeeRow> Employees,
    IReadOnlyList<ManagerReportInsight> Insights,
    string DataNote)
{
    public int TotalEmployees => Employees.Count;
    public int EmployeesAssessed => Employees.Count(employee => employee.SkillsAssessed > 0);

    public int AverageSkillProficiencyPercent
    {
        get
        {
            var assessedSkills = SkillProficiency.Where(skill => skill.CurrentLevel.HasValue).ToList();
            return assessedSkills.Count == 0
                ? 0
                : (int)Math.Round(assessedSkills.Average(skill => skill.CurrentLevel.GetValueOrDefault() * 20.0));
        }
    }

    public int CompletedTraining => TrainingPrograms.Count(training =>
        string.Equals(training.Status, "Completed", StringComparison.OrdinalIgnoreCase));
    public int InProgressTraining => TrainingPrograms.Count(training =>
        string.Equals(training.Status, "In Progress", StringComparison.OrdinalIgnoreCase));
    public int PendingTraining => TrainingPrograms.Count - CompletedTraining - InProgressTraining;
    public int TrainingCompletionPercent => TrainingPrograms.Count == 0
        ? 0
        : (int)Math.Round(TrainingPrograms.Average(training => training.ProgressPercent));

    public IReadOnlyList<ManagerReportSkillRow> IdentifiedSkillGaps =>
        SkillProficiency.Where(skill => skill.Gap is > 0).ToList();

    public IReadOnlyList<ManagerReportEmployeeRow> EmployeesNeedingTraining =>
        Employees.Where(employee =>
            IdentifiedSkillGaps.Any(skill =>
                string.Equals(skill.Employee, employee.Name, StringComparison.OrdinalIgnoreCase)) ||
            employee.TrainingStatus is "Not assigned" or "Not started").ToList();
}

public record ActivityItem(string Title, string Detail, string Time, string Icon);

public record Achievement(string Title, string Icon);

public record ManagerEmployee(string Name, string Initials, string Tone, string Department, string Skill, string Progress, int Percent);

public record ManagerSkillGap(
    string Employee,
    string Role,
    string Department,
    string Skill,
    int? CurrentLevel,
    int? RequiredLevel,
    string RecommendedAction)
{
    public int? Gap => CurrentLevel.HasValue && RequiredLevel.HasValue
        ? Math.Max(0, RequiredLevel.Value - CurrentLevel.Value)
        : null;
}

public record ManagerSkillGapDetail(
    string Employee,
    string Role,
    string Department,
    IReadOnlyList<ManagerSkillGap> Skills);

public record ManagerLearningPlanSkill(string Name, int CurrentLevel, int RequiredLevel)
{
    public int Gap => Math.Max(0, RequiredLevel - CurrentLevel);
}

public record ManagerLearningTraining(
    string Name,
    string SkillCategory,
    string Duration,
    string Priority,
    string Status,
    string AssignedDate = "",
    string TargetCompletionDate = "",
    int? CompletionPercent = null,
    string? StartedDate = null,
    string? CompletedDate = null)
{
    public int ProgressPercent => Math.Clamp(CompletionPercent ?? Status switch
    {
        "Completed" => 100,
        "In Progress" => 50,
        _ => 0
    }, 0, 100);
}

public record ManagerLearningPlanDetail(
    string Id,
    string Employee,
    string Role,
    string Department,
    string Plan,
    string AssignedDate,
    string TargetCompletionDate,
    string Status,
    IReadOnlyList<ManagerLearningPlanSkill> Skills,
    IReadOnlyList<ManagerLearningTraining> Trainings)
{
    public int CompletedModules => Trainings.Count(training =>
        string.Equals(training.Status, "Completed", StringComparison.OrdinalIgnoreCase));

    public int InProgressModules => Trainings.Count(training =>
        string.Equals(training.Status, "In Progress", StringComparison.OrdinalIgnoreCase));

    public int PendingModules => Trainings.Count - CompletedModules - InProgressModules;

    public int ProgressPercent => Trainings.Count == 0
        ? 0
        : (int)Math.Round(Trainings.Average(training => training.ProgressPercent));
}

public record ManagerTrainingAssessment(
    string Name,
    string? Score,
    string? CompletionDate,
    string Status,
    string Result);

public record ManagerTrainingProgressDetail(
    string Employee,
    string Role,
    string Department,
    ManagerLearningPlanDetail? LearningPlan,
    IReadOnlyList<ManagerTrainingAssessment> Assessments)
{
    public string PlanName => LearningPlan?.Plan ?? "Not assigned";
    public string TrainingStatus => LearningPlan?.Status ?? "Not assigned";
    public IReadOnlyList<ManagerLearningTraining> Trainings =>
        LearningPlan?.Trainings ?? Array.Empty<ManagerLearningTraining>();
    public int TotalCourses => Trainings.Count;
    public int CompletedCourses => Trainings.Count(training =>
        string.Equals(training.Status, "Completed", StringComparison.OrdinalIgnoreCase));
    public int InProgressCourses => Trainings.Count(training =>
        string.Equals(training.Status, "In Progress", StringComparison.OrdinalIgnoreCase));
    public int PendingCourses => TotalCourses - CompletedCourses - InProgressCourses;
    public int OverallCompletionPercent => TotalCourses == 0
        ? 0
        : (int)Math.Round(Trainings.Average(training => training.ProgressPercent));
}
