using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillBridge.Domain.Entities;

namespace SkillBridge.Infrastructure.Persistence.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.HasKey(u => u.Id);
        builder.HasIndex(u => u.IdentityUserId).IsUnique();
        builder.HasIndex(u => u.Email).IsUnique();
        builder.Property(u => u.FullName).HasMaxLength(150).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(256).IsRequired();
        builder.Property(u => u.EmployeeCode).HasMaxLength(32).IsRequired();
        builder.Property(u => u.AvatarInitials).HasMaxLength(8).IsRequired();
        builder.Property(u => u.BatchLabel).HasMaxLength(64).IsRequired();

        builder.HasOne(u => u.Department)
            .WithMany(d => d.Users)
            .HasForeignKey(u => u.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(u => u.TargetRole)
            .WithMany()
            .HasForeignKey(u => u.TargetRoleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(u => u.ManagerProfile)
            .WithMany()
            .HasForeignKey(u => u.ManagerProfileId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(u => u.Settings)
            .WithOne(s => s.UserProfile)
            .HasForeignKey<UserSettings>(s => s.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.TokenHash).HasMaxLength(128).IsRequired();
        builder.Property(r => r.ReplacedByTokenHash).HasMaxLength(128);
        builder.HasIndex(r => r.TokenHash).IsUnique();

        builder.HasOne(r => r.UserProfile)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(r => r.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ManagerInvitationConfiguration : IEntityTypeConfiguration<ManagerInvitation>
{
    public void Configure(EntityTypeBuilder<ManagerInvitation> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Email).HasMaxLength(256).IsRequired();
        builder.Property(i => i.TokenHash).HasMaxLength(128).IsRequired();
        builder.Property(i => i.DisplayCode).HasMaxLength(64).IsRequired();
        builder.HasIndex(i => i.TokenHash).IsUnique();

        builder.HasOne(i => i.Department)
            .WithMany()
            .HasForeignKey(i => i.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Name).HasMaxLength(120).IsRequired();
        builder.HasIndex(d => d.Name).IsUnique();
    }
}

public class JobRoleConfiguration : IEntityTypeConfiguration<JobRole>
{
    public void Configure(EntityTypeBuilder<JobRole> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Title).HasMaxLength(120).IsRequired();

        builder.HasOne(r => r.Department)
            .WithMany(d => d.JobRoles)
            .HasForeignKey(r => r.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class SkillConfiguration : IEntityTypeConfiguration<Skill>
{
    public void Configure(EntityTypeBuilder<Skill> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Code).HasMaxLength(40).IsRequired();
        builder.Property(s => s.Name).HasMaxLength(120).IsRequired();
        builder.HasIndex(s => s.Code).IsUnique();
    }
}

public class RoleSkillRequirementConfiguration : IEntityTypeConfiguration<RoleSkillRequirement>
{
    public void Configure(EntityTypeBuilder<RoleSkillRequirement> builder)
    {
        builder.HasKey(r => r.Id);
        builder.HasIndex(r => new { r.JobRoleId, r.SkillId }).IsUnique();
        builder.Property(r => r.Weight).HasPrecision(5, 2);

        builder.HasOne(r => r.JobRole)
            .WithMany(j => j.SkillRequirements)
            .HasForeignKey(r => r.JobRoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Skill)
            .WithMany()
            .HasForeignKey(r => r.SkillId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class EmployeeSkillConfiguration : IEntityTypeConfiguration<EmployeeSkill>
{
    public void Configure(EntityTypeBuilder<EmployeeSkill> builder)
    {
        builder.HasKey(es => es.Id);
        builder.HasIndex(es => new { es.UserProfileId, es.SkillId }).IsUnique();

        builder.HasOne(es => es.UserProfile)
            .WithMany(u => u.EmployeeSkills)
            .HasForeignKey(es => es.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(es => es.Skill)
            .WithMany()
            .HasForeignKey(es => es.SkillId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AssessmentConfiguration : IEntityTypeConfiguration<Assessment>
{
    public void Configure(EntityTypeBuilder<Assessment> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Title).HasMaxLength(180).IsRequired();

        builder.HasOne(a => a.JobRole)
            .WithMany()
            .HasForeignKey(a => a.JobRoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AssessmentQuestionConfiguration : IEntityTypeConfiguration<AssessmentQuestion>
{
    public void Configure(EntityTypeBuilder<AssessmentQuestion> builder)
    {
        builder.HasKey(q => q.Id);
        builder.HasOne(q => q.Assessment)
            .WithMany(a => a.Questions)
            .HasForeignKey(q => q.AssessmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(q => q.Skill)
            .WithMany()
            .HasForeignKey(q => q.SkillId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AssessmentAttemptConfiguration : IEntityTypeConfiguration<AssessmentAttempt>
{
    public void Configure(EntityTypeBuilder<AssessmentAttempt> builder)
    {
        builder.HasKey(a => a.Id);
        builder.HasOne(a => a.Assessment)
            .WithMany()
            .HasForeignKey(a => a.AssessmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.UserProfile)
            .WithMany(u => u.AssessmentAttempts)
            .HasForeignKey(a => a.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AssessmentAnswerConfiguration : IEntityTypeConfiguration<AssessmentAnswer>
{
    public void Configure(EntityTypeBuilder<AssessmentAnswer> builder)
    {
        builder.HasKey(a => a.Id);
        builder.HasOne(a => a.Attempt)
            .WithMany(att => att.Answers)
            .HasForeignKey(a => a.AttemptId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class LearningPlanConfiguration : IEntityTypeConfiguration<LearningPlan>
{
    public void Configure(EntityTypeBuilder<LearningPlan> builder)
    {
        builder.HasKey(lp => lp.Id);
        builder.Property(lp => lp.Title).HasMaxLength(200).IsRequired();
        builder.HasOne(lp => lp.TargetRole)
            .WithMany()
            .HasForeignKey(lp => lp.TargetRoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class LearningModuleConfiguration : IEntityTypeConfiguration<LearningModule>
{
    public void Configure(EntityTypeBuilder<LearningModule> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.EstimatedHours).HasPrecision(5, 2);

        builder.HasOne(m => m.LearningPlan)
            .WithMany(lp => lp.Modules)
            .HasForeignKey(m => m.LearningPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Skill)
            .WithMany()
            .HasForeignKey(m => m.SkillId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class EmployeeLearningPlanConfiguration : IEntityTypeConfiguration<EmployeeLearningPlan>
{
    public void Configure(EntityTypeBuilder<EmployeeLearningPlan> builder)
    {
        builder.HasKey(ep => ep.Id);
        builder.HasOne(ep => ep.UserProfile)
            .WithMany(u => u.LearningPlans)
            .HasForeignKey(ep => ep.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ep => ep.LearningPlan)
            .WithMany()
            .HasForeignKey(ep => ep.LearningPlanId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class EmployeeModuleProgressConfiguration : IEntityTypeConfiguration<EmployeeModuleProgress>
{
    public void Configure(EntityTypeBuilder<EmployeeModuleProgress> builder)
    {
        builder.HasKey(mp => mp.Id);
        builder.HasOne(mp => mp.EmployeeLearningPlan)
            .WithMany(ep => ep.ModuleProgresses)
            .HasForeignKey(mp => mp.EmployeeLearningPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(mp => mp.LearningModule)
            .WithMany()
            .HasForeignKey(mp => mp.LearningModuleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class TrainingResourceConfiguration : IEntityTypeConfiguration<TrainingResource>
{
    public void Configure(EntityTypeBuilder<TrainingResource> builder)
    {
        builder.HasKey(r => r.Id);
        builder.HasOne(r => r.Skill)
            .WithMany()
            .HasForeignKey(r => r.SkillId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class CandidateConfiguration : IEntityTypeConfiguration<Candidate>
{
    public void Configure(EntityTypeBuilder<Candidate> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Email).HasMaxLength(256).IsRequired();
        builder.HasIndex(c => c.Email);

        builder.HasOne(c => c.JobRole)
            .WithMany()
            .HasForeignKey(c => c.JobRoleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Department)
            .WithMany()
            .HasForeignKey(c => c.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class OperationsConfiguration :
    IEntityTypeConfiguration<Notification>,
    IEntityTypeConfiguration<AiChatSession>,
    IEntityTypeConfiguration<AiChatMessage>,
    IEntityTypeConfiguration<Achievement>,
    IEntityTypeConfiguration<EmployeeAchievement>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(n => n.Id);
        builder.HasOne(n => n.UserProfile)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public void Configure(EntityTypeBuilder<AiChatSession> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Mode).HasMaxLength(64).IsRequired();
        builder.HasOne(s => s.UserProfile)
            .WithMany()
            .HasForeignKey(s => s.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public void Configure(EntityTypeBuilder<AiChatMessage> builder)
    {
        builder.HasKey(m => m.Id);
        builder.HasOne(m => m.Session)
            .WithMany(s => s.Messages)
            .HasForeignKey(m => m.AiChatSessionId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public void Configure(EntityTypeBuilder<Achievement> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Code).HasMaxLength(64).IsRequired();
        builder.HasIndex(a => a.Code).IsUnique();
    }

    public void Configure(EntityTypeBuilder<EmployeeAchievement> builder)
    {
        builder.HasKey(ea => ea.Id);
        builder.HasIndex(ea => new { ea.UserProfileId, ea.AchievementId }).IsUnique();

        builder.HasOne(ea => ea.UserProfile)
            .WithMany()
            .HasForeignKey(ea => ea.UserProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ea => ea.Achievement)
            .WithMany()
            .HasForeignKey(ea => ea.AchievementId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
