using SkillBridge.Application.DTOs;
using SkillBridge.Application.Services;
using SkillBridge.Application.Validators;
using SkillBridge.Domain.Entities;
using Xunit;

namespace SkillBridge.UnitTests;

public class SkillGapEngineTests
{
    [Theory]
    [InlineData(95, 5)]
    [InlineData(80, 4)]
    [InlineData(65, 3)]
    [InlineData(45, 2)]
    [InlineData(10, 1)]
    public void ComputeLevelFromPercentage_ReturnsExpectedProficiencyScale(int percent, int expectedLevel)
    {
        var level = SkillGapEngine.ComputeLevelFromPercentage(percent);
        Assert.Equal(expectedLevel, level);
    }

    [Fact]
    public void ComputeGap_NeverReturnsNegativeValues()
    {
        Assert.Equal(2, SkillGapEngine.ComputeGap(2, 4));
        Assert.Equal(0, SkillGapEngine.ComputeGap(5, 4));
    }

    [Fact]
    public void ComputeOverallReadinessPercent_CalculatesWeightedReadinessRatio()
    {
        var skills = new List<EmployeeSkill>
        {
            new() { CurrentLevel = 4, TargetLevel = 4 },
            new() { CurrentLevel = 2, TargetLevel = 4 }
        };

        var percent = SkillGapEngine.ComputeOverallReadinessPercent(skills);
        Assert.Equal(75, percent);
    }

    [Fact]
    public void BuildExplainableInsight_IdentifiesHighestGapSkill()
    {
        var skills = new List<EmployeeSkill>
        {
            new() { CurrentLevel = 3, TargetLevel = 4, GapScore = 1, Skill = new Skill { Name = "TypeScript" } },
            new() { CurrentLevel = 1, TargetLevel = 4, GapScore = 3, Skill = new Skill { Name = "SQL Server" } }
        };

        var insight = SkillGapEngine.BuildExplainableInsight(skills, "Software Developer");
        Assert.Contains("SQL Server", insight);
        Assert.Contains("Software Developer", insight);
    }

    [Fact]
    public void SendChatMessageValidator_AllowsOnlyFiveFigmaAssistantModes()
    {
        var validator = new SendChatMessageValidator();

        var valid = validator.Validate(new SendChatMessageRequestDto("Coding Help", "How do I write a clean LINQ query?"));
        var invalid = validator.Validate(new SendChatMessageRequestDto("Unknown Mode", "Hello"));

        Assert.True(valid.IsValid);
        Assert.False(invalid.IsValid);
    }
}
