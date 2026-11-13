namespace SkillBridge.Models;

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
    string AvatarTone);

public record ReportRow(string Name, string Department, string GeneratedOn, string CreatedBy, string Format, string Action);

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
