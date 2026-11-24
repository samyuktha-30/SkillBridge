using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Domain.Entities;

namespace SkillBridge.Infrastructure.Persistence;

public class ApplicationDbContext
    : IdentityDbContext<IdentityUser<Guid>, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<ManagerInvitation> ManagerInvitations => Set<ManagerInvitation>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<JobRole> JobRoles => Set<JobRole>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<RoleSkillRequirement> RoleSkillRequirements => Set<RoleSkillRequirement>();
    public DbSet<EmployeeSkill> EmployeeSkills => Set<EmployeeSkill>();
    public DbSet<Assessment> Assessments => Set<Assessment>();
    public DbSet<AssessmentQuestion> AssessmentQuestions => Set<AssessmentQuestion>();
    public DbSet<AssessmentAttempt> AssessmentAttempts => Set<AssessmentAttempt>();
    public DbSet<AssessmentAnswer> AssessmentAnswers => Set<AssessmentAnswer>();
    public DbSet<LearningPlan> LearningPlans => Set<LearningPlan>();
    public DbSet<LearningModule> LearningModules => Set<LearningModule>();
    public DbSet<EmployeeLearningPlan> EmployeeLearningPlans => Set<EmployeeLearningPlan>();
    public DbSet<EmployeeModuleProgress> EmployeeModuleProgresses => Set<EmployeeModuleProgress>();
    public DbSet<TrainingResource> TrainingResources => Set<TrainingResource>();
    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AiChatSession> AiChatSessions => Set<AiChatSession>();
    public DbSet<AiChatMessage> AiChatMessages => Set<AiChatMessage>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<EmployeeAchievement> EmployeeAchievements => Set<EmployeeAchievement>();
    public DbSet<ReportRecord> ReportRecords => Set<ReportRecord>();
    public DbSet<ReportSchedule> ReportSchedules => Set<ReportSchedule>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
