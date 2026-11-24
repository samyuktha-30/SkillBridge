using Microsoft.EntityFrameworkCore;
using SkillBridge.Domain.Entities;

namespace SkillBridge.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<UserProfile> UserProfiles { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<ManagerInvitation> ManagerInvitations { get; }
    DbSet<UserSettings> UserSettings { get; }
    DbSet<Department> Departments { get; }
    DbSet<JobRole> JobRoles { get; }
    DbSet<Skill> Skills { get; }
    DbSet<RoleSkillRequirement> RoleSkillRequirements { get; }
    DbSet<EmployeeSkill> EmployeeSkills { get; }
    DbSet<Assessment> Assessments { get; }
    DbSet<AssessmentQuestion> AssessmentQuestions { get; }
    DbSet<AssessmentAttempt> AssessmentAttempts { get; }
    DbSet<AssessmentAnswer> AssessmentAnswers { get; }
    DbSet<LearningPlan> LearningPlans { get; }
    DbSet<LearningModule> LearningModules { get; }
    DbSet<EmployeeLearningPlan> EmployeeLearningPlans { get; }
    DbSet<EmployeeModuleProgress> EmployeeModuleProgresses { get; }
    DbSet<TrainingResource> TrainingResources { get; }
    DbSet<Candidate> Candidates { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<AiChatSession> AiChatSessions { get; }
    DbSet<AiChatMessage> AiChatMessages { get; }
    DbSet<Achievement> Achievements { get; }
    DbSet<EmployeeAchievement> EmployeeAchievements { get; }
    DbSet<ReportRecord> ReportRecords { get; }
    DbSet<ReportSchedule> ReportSchedules { get; }
    DbSet<ActivityLog> ActivityLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
