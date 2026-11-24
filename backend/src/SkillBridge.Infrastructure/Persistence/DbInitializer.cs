using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SkillBridge.Domain.Entities;
using SkillBridge.Domain.Enums;

namespace SkillBridge.Infrastructure.Persistence;

/// <summary>
/// Seeds reference/catalog entities (Departments, JobRoles, Skills, RoleSkillRequirements,
/// Assessments + Questions, LearningPlan templates, TrainingResources, Achievements,
/// Identity Roles, and the bootstrap Admin user).
/// Does NOT fabricate synthetic employee dashboard scores or progress telemetry.
/// </summary>
public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<ApplicationDbContext>();
        var roleManager = sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = sp.GetRequiredService<UserManager<IdentityUser<Guid>>>();
        var config = sp.GetRequiredService<IConfiguration>();
        var logger = sp.GetRequiredService<ILogger<ApplicationDbContext>>();

        await db.Database.MigrateAsync();

        foreach (var roleName in Enum.GetNames<UserRole>())
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>
                {
                    Id = Guid.NewGuid(),
                    Name = roleName,
                    NormalizedName = roleName.ToUpperInvariant()
                });
            }
        }

        if (!await db.Departments.AnyAsync())
        {
            var eng = new Department { Name = "Engineering", Description = "Software architecture, frontend, backend, and platform reliability." };
            var data = new Department { Name = "Data & Insights", Description = "Analytics engineering, SQL modeling, and machine learning." };
            var ops = new Department { Name = "Operations", Description = "Technical support, incident triage, and customer reliability." };
            db.Departments.AddRange(eng, data, ops);
            await db.SaveChangesAsync();

            var devRole = new JobRole
            {
                Title = "Software Developer",
                Description = "Full-stack TypeScript, React, .NET 10, and SQL Server engineering.",
                DepartmentId = eng.Id,
                TargetScoreThreshold = 80
            };
            var analystRole = new JobRole
            {
                Title = "Data Analyst",
                Description = "SQL query optimization, Python data pipelines, and stakeholder insights.",
                DepartmentId = data.Id,
                TargetScoreThreshold = 80
            };
            var supportRole = new JobRole
            {
                Title = "Support Analyst",
                Description = "API diagnostics, relational troubleshooting, and structured communication.",
                DepartmentId = ops.Id,
                TargetScoreThreshold = 75
            };
            db.JobRoles.AddRange(devRole, analystRole, supportRole);
            await db.SaveChangesAsync();

            var tsSkill = new Skill { Code = "TS", Name = "TypeScript", Category = SkillCategory.Technical, SubCategory = "Programming", Description = "Strong static typing, generics, and async patterns." };
            var reactSkill = new Skill { Code = "REACT", Name = "React UI", Category = SkillCategory.Technical, SubCategory = "Web Development", Description = "Component composition, hooks, and accessible MUI interfaces." };
            var dotnetSkill = new Skill { Code = "DOTNET", Name = "C# & .NET API", Category = SkillCategory.Technical, SubCategory = "Programming", Description = "Clean Architecture, EF Core, JWT security, and REST APIs." };
            var sqlSkill = new Skill { Code = "SQL", Name = "SQL Server", Category = SkillCategory.Technical, SubCategory = "Data Science", Description = "Schema normalization, indexing, joins, and query plans." };
            var pySkill = new Skill { Code = "PY", Name = "Python & ML", Category = SkillCategory.Technical, SubCategory = "Machine Learning", Description = "FastAPI services, Scikit-learn analysis, and data pipelines." };
            var commSkill = new Skill { Code = "COMM", Name = "Technical Communication", Category = SkillCategory.Soft, SubCategory = "Soft Skills", Description = "Clear documentation, code review feedback, and cross-team alignment." };

            db.Skills.AddRange(tsSkill, reactSkill, dotnetSkill, sqlSkill, pySkill, commSkill);
            await db.SaveChangesAsync();

            db.RoleSkillRequirements.AddRange(
                new RoleSkillRequirement { JobRoleId = devRole.Id, SkillId = tsSkill.Id, RequiredLevel = 4, Weight = 1.2m },
                new RoleSkillRequirement { JobRoleId = devRole.Id, SkillId = reactSkill.Id, RequiredLevel = 4, Weight = 1.1m },
                new RoleSkillRequirement { JobRoleId = devRole.Id, SkillId = dotnetSkill.Id, RequiredLevel = 4, Weight = 1.2m },
                new RoleSkillRequirement { JobRoleId = devRole.Id, SkillId = sqlSkill.Id, RequiredLevel = 4, Weight = 1.0m },
                new RoleSkillRequirement { JobRoleId = devRole.Id, SkillId = pySkill.Id, RequiredLevel = 3, Weight = 0.8m },
                new RoleSkillRequirement { JobRoleId = devRole.Id, SkillId = commSkill.Id, RequiredLevel = 4, Weight = 0.9m },

                new RoleSkillRequirement { JobRoleId = analystRole.Id, SkillId = sqlSkill.Id, RequiredLevel = 5, Weight = 1.3m },
                new RoleSkillRequirement { JobRoleId = analystRole.Id, SkillId = pySkill.Id, RequiredLevel = 4, Weight = 1.2m },
                new RoleSkillRequirement { JobRoleId = analystRole.Id, SkillId = commSkill.Id, RequiredLevel = 4, Weight = 1.0m },

                new RoleSkillRequirement { JobRoleId = supportRole.Id, SkillId = sqlSkill.Id, RequiredLevel = 3, Weight = 1.1m },
                new RoleSkillRequirement { JobRoleId = supportRole.Id, SkillId = dotnetSkill.Id, RequiredLevel = 3, Weight = 1.0m },
                new RoleSkillRequirement { JobRoleId = supportRole.Id, SkillId = commSkill.Id, RequiredLevel = 5, Weight = 1.3m }
            );
            await db.SaveChangesAsync();

            // Baseline Assessments + Real Questions
            var fullStackAssessment = new Assessment
            {
                Title = "Full-Stack Core Baseline",
                Subtitle = "TypeScript, React & .NET 10 Architecture",
                Category = "Technical",
                JobRoleId = devRole.Id,
                DurationMinutes = 30,
                PassThresholdPercent = 70,
                ScheduledDueDateUtc = DateTime.UtcNow.AddDays(7)
            };
            var sqlAssessment = new Assessment
            {
                Title = "SQL Server & Data Modeling",
                Subtitle = "Indexing, Joins, and Relational Integrity",
                Category = "Technical",
                JobRoleId = devRole.Id,
                DurationMinutes = 25,
                PassThresholdPercent = 70,
                ScheduledDueDateUtc = DateTime.UtcNow.AddDays(12)
            };
            var softAssessment = new Assessment
            {
                Title = "Engineering Communication & ML Readiness",
                Subtitle = "Applied Python Analytics & Technical Collaboration",
                Category = "Soft Skills",
                JobRoleId = devRole.Id,
                DurationMinutes = 20,
                PassThresholdPercent = 70,
                ScheduledDueDateUtc = DateTime.UtcNow.AddDays(21)
            };
            db.Assessments.AddRange(fullStackAssessment, sqlAssessment, softAssessment);
            await db.SaveChangesAsync();

            db.AssessmentQuestions.AddRange(
                new AssessmentQuestion
                {
                    AssessmentId = fullStackAssessment.Id,
                    SkillId = tsSkill.Id,
                    Prompt = "Which TypeScript utility type constructs a type with all properties of T set to optional?",
                    OptionsJson = JsonSerializer.Serialize(new[] { "Required<T>", "Partial<T>", "Readonly<T>", "Pick<T, K>" }),
                    CorrectOptionIndex = 1,
                    Weight = 1
                },
                new AssessmentQuestion
                {
                    AssessmentId = fullStackAssessment.Id,
                    SkillId = reactSkill.Id,
                    Prompt = "When passing callbacks to memoized child components in React, which hook stabilizes the function reference?",
                    OptionsJson = JsonSerializer.Serialize(new[] { "useReducer", "useCallback", "useLayoutEffect", "useId" }),
                    CorrectOptionIndex = 1,
                    Weight = 1
                },
                new AssessmentQuestion
                {
                    AssessmentId = fullStackAssessment.Id,
                    SkillId = dotnetSkill.Id,
                    Prompt = "In Clean Architecture with ASP.NET Core, which layer should own Entity Framework Core DbContext implementations?",
                    OptionsJson = JsonSerializer.Serialize(new[] { "Domain", "Application", "Infrastructure", "Presentation Controllers" }),
                    CorrectOptionIndex = 2,
                    Weight = 1
                },
                new AssessmentQuestion
                {
                    AssessmentId = fullStackAssessment.Id,
                    SkillId = dotnetSkill.Id,
                    Prompt = "What happens when a rotated/revoked refresh token is submitted again during Refresh Token Rotation?",
                    OptionsJson = JsonSerializer.Serialize(new[]
                    {
                        "It issues a new token without checks",
                        "It detects reuse and revokes the entire token family",
                        "It extends the original token expiry",
                        "It resets the user's password"
                    }),
                    CorrectOptionIndex = 1,
                    Weight = 1
                },
                new AssessmentQuestion
                {
                    AssessmentId = sqlAssessment.Id,
                    SkillId = sqlSkill.Id,
                    Prompt = "Why should secondary foreign keys in SQL Server often use DeleteBehavior.Restrict or NoAction?",
                    OptionsJson = JsonSerializer.Serialize(new[]
                    {
                        "To disable primary keys",
                        "To prevent multiple cascade path cycles during schema creation",
                        "To skip transaction logging",
                        "To allow duplicate rows in unique indexes"
                    }),
                    CorrectOptionIndex = 1,
                    Weight = 1
                },
                new AssessmentQuestion
                {
                    AssessmentId = sqlAssessment.Id,
                    SkillId = sqlSkill.Id,
                    Prompt = "Which SQL clause filters grouped aggregate results after GROUP BY is evaluated?",
                    OptionsJson = JsonSerializer.Serialize(new[] { "WHERE", "HAVING", "ORDER BY", "DISTINCT" }),
                    CorrectOptionIndex = 1,
                    Weight = 1
                },
                new AssessmentQuestion
                {
                    AssessmentId = softAssessment.Id,
                    SkillId = pySkill.Id,
                    Prompt = "Before running K-Means clustering in Scikit-learn on skill gap vectors, why is StandardScaler applied?",
                    OptionsJson = JsonSerializer.Serialize(new[]
                    {
                        "To equalize feature variance so larger scales do not dominate Euclidean distance",
                        "To delete missing rows automatically",
                        "To convert JSON into SQL tables",
                        "To bypass model evaluation"
                    }),
                    CorrectOptionIndex = 0,
                    Weight = 1
                },
                new AssessmentQuestion
                {
                    AssessmentId = softAssessment.Id,
                    SkillId = commSkill.Id,
                    Prompt = "When presenting a skill-gap report to engineering leadership, what makes insights actionable?",
                    OptionsJson = JsonSerializer.Serialize(new[]
                    {
                        "Claiming unverified model accuracy numbers",
                        "Explaining exact current vs target levels alongside concrete next steps",
                        "Hiding unassessed employees",
                        "Using unlabelled radar axes"
                    }),
                    CorrectOptionIndex = 1,
                    Weight = 1
                }
            );

            // Standard Reference Learning Plan Template
            var devPlan = new LearningPlan
            {
                Title = "Software Developer Core Upskilling Track",
                TargetRoleId = devRole.Id,
                IsAiGenerated = false,
                EstimatedWeeks = 4,
                GoalLabel = "Software Developer Readiness"
            };
            db.LearningPlans.Add(devPlan);
            await db.SaveChangesAsync();

            db.LearningModules.AddRange(
                new LearningModule { LearningPlanId = devPlan.Id, SkillId = tsSkill.Id, OrderIndex = 1, Title = "TypeScript Strict Typing & Generics", Description = "Master discriminated unions, generics, and type-safe API clients.", EstimatedHours = 4.0m },
                new LearningModule { LearningPlanId = devPlan.Id, SkillId = dotnetSkill.Id, OrderIndex = 2, Title = ".NET 10 Clean Architecture & JWT Security", Description = "Implement repository abstractions, FluentValidation, and token rotation.", EstimatedHours = 5.0m },
                new LearningModule { LearningPlanId = devPlan.Id, SkillId = sqlSkill.Id, OrderIndex = 3, Title = "SQL Server Indexing & Execution Plans", Description = "Design normalized schemas and eliminate N+1 EF Core queries.", EstimatedHours = 4.0m },
                new LearningModule { LearningPlanId = devPlan.Id, SkillId = commSkill.Id, OrderIndex = 4, Title = "Architecture Reviews & Technical Writing", Description = "Document ADRs and communicate trade-offs clearly with stakeholders.", EstimatedHours = 2.5m }
            );

            // Curated Training Resource Catalog
            db.TrainingResources.AddRange(
                new TrainingResource { Title = "TypeScript Deep Dive for React Apps", Description = "Build resilient component contracts and discriminated union state machines.", Provider = "TypeScript Handbook", Category = "Programming", ResourceType = ResourceType.Course, Difficulty = "Intermediate", DurationLabel = "3h 30m", Url = "https://www.typescriptlang.org/docs/", SkillId = tsSkill.Id },
                new TrainingResource { Title = "React Patterns & Hooks Performance", Description = "Avoid unnecessary renders with clean effect boundaries and memoization.", Provider = "React Docs", Category = "Web Development", ResourceType = ResourceType.Article, Difficulty = "Intermediate", DurationLabel = "1h 15m", Url = "https://react.dev/learn", SkillId = reactSkill.Id },
                new TrainingResource { Title = "ASP.NET Core Clean Architecture Workshop", Description = "Separate Domain, Application, Infrastructure, and API layers cleanly.", Provider = "Microsoft Learn", Category = "Programming", ResourceType = ResourceType.Course, Difficulty = "Intermediate", DurationLabel = "4h 00m", Url = "https://learn.microsoft.com/en-us/aspnet/core/", SkillId = dotnetSkill.Id },
                new TrainingResource { Title = "SQL Server Query Tuning & Indexes", Description = "Read execution plans, design covering indexes, and tune EF Core queries.", Provider = "SQL Server Docs", Category = "Data Science", ResourceType = ResourceType.Video, Difficulty = "Intermediate", DurationLabel = "2h 20m", Url = "https://learn.microsoft.com/en-us/sql/relational-databases/indexes/", SkillId = sqlSkill.Id },
                new TrainingResource { Title = "Scikit-learn Clustering Fundamentals", Description = "Apply StandardScaler and K-Means responsibly with transparent assumptions.", Provider = "Scikit-learn Guide", Category = "Machine Learning", ResourceType = ResourceType.Practice, Difficulty = "Beginner", DurationLabel = "2h 45m", Url = "https://scikit-learn.org/stable/modules/clustering.html", SkillId = pySkill.Id },
                new TrainingResource { Title = "Writing Clear Engineering RFCs", Description = "Structure technical proposals, risks, and measurable outcomes for teams.", Provider = "Engineering Playbook", Category = "Soft Skills", ResourceType = ResourceType.Article, Difficulty = "Beginner", DurationLabel = "45m", Url = "https://refactoring.guru/", SkillId = commSkill.Id }
            );

            // Achievements Catalog
            db.Achievements.AddRange(
                new Achievement { Code = "FIRST_ASSESSMENT", Title = "Baseline Established", Description = "Completed your first skill assessment." },
                new Achievement { Code = "HIGH_SCORER", Title = "High Scorer (80%+)", Description = "Achieved 80% or higher on a technical assessment." },
                new Achievement { Code = "FAST_LEARNER", Title = "Module Finisher", Description = "Completed a personalized learning plan module." },
                new Achievement { Code = "PLAN_FINISHER", Title = "Roadmap Champion", Description = "Completed 100% of an assigned learning plan." }
            );

            await db.SaveChangesAsync();
        }

        // Bootstrap Admin Account (configured via Seed:AdminEmail & Seed:AdminPassword)
        var adminEmail = (config["Seed:AdminEmail"] ?? "admin@skillbridge.ai").Trim().ToLowerInvariant();
        var adminPassword = config["Seed:AdminPassword"];
        if (!string.IsNullOrWhiteSpace(adminPassword) && await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var identityUser = new IdentityUser<Guid>
            {
                Id = Guid.NewGuid(),
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };
            var res = await userManager.CreateAsync(identityUser, adminPassword);
            if (res.Succeeded)
            {
                await userManager.AddToRoleAsync(identityUser, UserRole.Admin.ToString());
                var engDept = await db.Departments.OrderBy(d => d.Name).FirstOrDefaultAsync();
                db.UserProfiles.Add(new UserProfile
                {
                    IdentityUserId = identityUser.Id,
                    FullName = "SkillBridge Administrator",
                    Email = adminEmail,
                    EmployeeCode = "ADM-0001",
                    AvatarInitials = "SA",
                    BatchLabel = "Platform Admin",
                    JobTitle = "System Administrator",
                    Role = UserRole.Admin,
                    ApprovalStatus = ApprovalStatus.Active,
                    DepartmentId = engDept?.Id
                });
                await db.SaveChangesAsync();
                logger.LogInformation("Seeded bootstrap Admin account {Email}.", adminEmail);
            }
        }

        // Seed Manager Login Account
        var managerEmail = (config["Seed:ManagerEmail"] ?? "manager@skillbridge.ai").Trim().ToLowerInvariant();
        var managerPassword = config["Seed:ManagerPassword"];
        if (!string.IsNullOrWhiteSpace(managerPassword) && await userManager.FindByEmailAsync(managerEmail) == null)
        {
            var identityUser = new IdentityUser<Guid>
            {
                Id = Guid.NewGuid(),
                UserName = managerEmail,
                Email = managerEmail,
                EmailConfirmed = true
            };
            var res = await userManager.CreateAsync(identityUser, managerPassword);
            if (res.Succeeded)
            {
                await userManager.AddToRoleAsync(identityUser, UserRole.Manager.ToString());
                var engDept = await db.Departments.OrderBy(d => d.Name).FirstOrDefaultAsync();
                var mgrProfile = new UserProfile
                {
                    IdentityUserId = identityUser.Id,
                    FullName = "Priya Shah",
                    Email = managerEmail,
                    EmployeeCode = "MGR-1001",
                    AvatarInitials = "PS",
                    BatchLabel = "Leadership",
                    JobTitle = "Engineering Manager",
                    Role = UserRole.Manager,
                    ApprovalStatus = ApprovalStatus.Active,
                    DepartmentId = engDept?.Id
                };
                db.UserProfiles.Add(mgrProfile);
                db.UserSettings.Add(new UserSettings { UserProfileId = mgrProfile.Id });
                await db.SaveChangesAsync();
                logger.LogInformation("Seeded Manager account {Email}.", managerEmail);
            }
            else
            {
                logger.LogWarning("Failed to seed Manager account {Email}: {Errors}",
                    managerEmail, string.Join("; ", res.Errors.Select(e => e.Description)));
            }
        }

        // Seed Employee Login Account (samyukthasahana2004@gmail.com)
        var employeeEmail = (config["Seed:EmployeeEmail"] ?? "samyukthasahana2004@gmail.com").Trim().ToLowerInvariant();
        var employeePassword = config["Seed:EmployeePassword"];
        if (!string.IsNullOrWhiteSpace(employeePassword) && await userManager.FindByEmailAsync(employeeEmail) == null)
        {
            var identityUser = new IdentityUser<Guid>
            {
                Id = Guid.NewGuid(),
                UserName = employeeEmail,
                Email = employeeEmail,
                EmailConfirmed = true
            };
            var res = await userManager.CreateAsync(identityUser, employeePassword);
            if (res.Succeeded)
            {
                await userManager.AddToRoleAsync(identityUser, UserRole.Employee.ToString());
                var engDept = await db.Departments.OrderBy(d => d.Name).FirstOrDefaultAsync();
                var devRole = await db.JobRoles.OrderBy(r => r.Title).FirstOrDefaultAsync(r => r.Title == "Software Developer")
                    ?? await db.JobRoles.OrderBy(r => r.Title).FirstOrDefaultAsync();

                var empProfile = new UserProfile
                {
                    IdentityUserId = identityUser.Id,
                    FullName = "Samyuktha Sahana",
                    Email = employeeEmail,
                    EmployeeCode = "EMP-1001",
                    AvatarInitials = "SS",
                    BatchLabel = $"Cohort {DateTime.UtcNow:yyyy}",
                    JobTitle = devRole?.Title ?? "Software Developer",
                    Role = UserRole.Employee,
                    ApprovalStatus = ApprovalStatus.Active,
                    DepartmentId = engDept?.Id,
                    TargetRoleId = devRole?.Id
                };
                db.UserProfiles.Add(empProfile);
                db.UserSettings.Add(new UserSettings { UserProfileId = empProfile.Id });
                db.Notifications.Add(new Notification
                {
                    UserProfileId = empProfile.Id,
                    Category = NotificationCategory.System,
                    Title = "Welcome to SkillBridge AI",
                    Message = "Start by taking a baseline skills assessment so we can calculate your role skill gaps and personalize your learning plan.",
                    ActionLabel = "Open Assessments",
                    ActionRoute = "/employee/assessments"
                });
                await db.SaveChangesAsync();
                logger.LogInformation("Seeded Employee account {Email}.", employeeEmail);
            }
            else
            {
                logger.LogWarning("Failed to seed Employee account {Email}: {Errors}",
                    employeeEmail, string.Join("; ", res.Errors.Select(e => e.Description)));
            }
        }
    }
}
