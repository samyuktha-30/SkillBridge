using SkillBridge.Domain.Entities;

namespace SkillBridge.Application.Services;

/// <summary>
/// Explainable, deterministic skill-gap engine owned by the .NET 10 Application layer.
/// Never invents synthetic training metrics or fabricated accuracy figures.
/// </summary>
public static class SkillGapEngine
{
    public static int ComputeLevelFromPercentage(int percentage)
    {
        return percentage switch
        {
            >= 90 => 5,
            >= 75 => 4,
            >= 60 => 3,
            >= 40 => 2,
            > 0 => 1,
            _ => 1
        };
    }

    public static int ComputeGap(int currentLevel, int requiredLevel)
    {
        return Math.Max(0, requiredLevel - currentLevel);
    }

    public static int ComputeOverallReadinessPercent(IEnumerable<EmployeeSkill> skills)
    {
        var list = skills.ToList();
        if (list.Count == 0) return 0;

        var totalTarget = list.Sum(s => Math.Max(1, s.TargetLevel));
        var totalAchieved = list.Sum(s => Math.Min(s.CurrentLevel, s.TargetLevel));
        return (int)Math.Round((double)totalAchieved / totalTarget * 100.0);
    }

    public static string BuildExplainableInsight(IEnumerable<EmployeeSkill> skills, string targetRoleTitle)
    {
        var list = skills.ToList();
        if (list.Count == 0)
        {
            return $"Complete your baseline assessment to calculate explainable skill gaps for {targetRoleTitle}.";
        }

        var gaps = list.Where(s => s.GapScore > 0).OrderByDescending(s => s.GapScore).ToList();
        if (gaps.Count == 0)
        {
            return $"You currently meet or exceed all required skill levels for {targetRoleTitle}.";
        }

        var topGap = gaps.First();
        return $"Priority focus for {targetRoleTitle}: {topGap.Skill?.Name ?? "Core Skill"} (Current {topGap.CurrentLevel}/5 vs Required {topGap.TargetLevel}/5, Gap: {topGap.GapScore} level). {gaps.Count} total skills require targeted upskilling.";
    }
}
