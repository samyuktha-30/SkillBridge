using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;
using SkillBridge.Domain.Entities;
using SkillBridge.Domain.Enums;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.Application.Services;

public class EmployeeWorkspaceService : IEmployeeWorkspaceService
{
    private readonly IApplicationDbContext _db;
    private readonly IIdentityAuthService _identity;
    private readonly IAiServiceClient _aiClient;

    public EmployeeWorkspaceService(
        IApplicationDbContext db,
        IIdentityAuthService identity,
        IAiServiceClient aiClient)
    {
        _db = db;
        _identity = identity;
        _aiClient = aiClient;
    }

    public async Task<EmployeeDashboardDto> GetDashboardAsync(Guid userProfileId, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var skills = await BuildEffectiveSkillItemsAsync(profile, ct);
        var radarSkills = skills.Take(6).Select(s => new SkillOverviewPointDto(s.Name, s.CurrentLevel, s.RequiredLevel)).ToList();

        var latestCompletedAttempt = await _db.AssessmentAttempts
            .Where(a => a.UserProfileId == userProfileId && a.Status == AssessmentAttemptStatus.Completed)
            .OrderByDescending(a => a.CompletedAtUtc)
            .FirstOrDefaultAsync(ct);

        var activePlan = await GetLatestEmployeePlanAsync(userProfileId, ct);
        var roadmapSteps = activePlan == null
            ? new List<RoadmapStepSummaryDto>()
            : MapRoadmapSteps(activePlan);

        var gapSkillNames = skills.Where(s => s.GapLevel > 0).Select(s => s.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var allResources = await _db.TrainingResources.Include(r => r.Skill).ToListAsync(ct);
        var recommendedResources = allResources
            .OrderByDescending(r => gapSkillNames.Contains(r.Skill.Name))
            .ThenBy(r => r.Title)
            .Take(3)
            .Select(r => MapResourceCard(r, gapSkillNames.Contains(r.Skill.Name),
                gapSkillNames.Contains(r.Skill.Name) ? $"Closes gap in {r.Skill.Name}" : "Core role skill reinforcement"))
            .ToList();

        var upcomingAssessments = await _db.Assessments
            .Where(a => a.ScheduledDueDateUtc != null &&
                        !_db.AssessmentAttempts.Any(att => att.UserProfileId == userProfileId && att.AssessmentId == a.Id && att.Status == AssessmentAttemptStatus.Completed))
            .OrderBy(a => a.ScheduledDueDateUtc)
            .Take(2)
            .ToListAsync(ct);

        var upcomingActivities = upcomingAssessments.Select(a =>
        {
            var daysLeft = Math.Max(0, (int)Math.Ceiling((a.ScheduledDueDateUtc!.Value - DateTime.UtcNow).TotalDays));
            return new UpcomingActivityDto(
                a.Id,
                a.Title,
                $"Due {a.ScheduledDueDateUtc.Value:MMM d, yyyy}",
                daysLeft == 0 ? "Due today" : $"{daysLeft} days left",
                "/employee/assessments");
        }).ToList();

        if (activePlan != null && activePlan.DueDateUtc.HasValue && activePlan.ProgressPercent < 100)
        {
            var daysLeft = Math.Max(0, (int)Math.Ceiling((activePlan.DueDateUtc.Value - DateTime.UtcNow).TotalDays));
            upcomingActivities.Add(new UpcomingActivityDto(
                activePlan.Id,
                $"{activePlan.LearningPlan.Title} Target",
                $"Due {activePlan.DueDateUtc.Value:MMM d, yyyy}",
                daysLeft == 0 ? "Due today" : $"{daysLeft} days left",
                "/employee/learning-plan"));
        }

        var gapsCount = skills.Count(s => s.GapLevel > 0);
        var planPercent = activePlan?.ProgressPercent ?? 0;
        var readiness = ComputeReadinessPercentFromItems(skills);
        var overallProgress = latestCompletedAttempt == null && activePlan == null
            ? 0
            : (int)Math.Round((readiness * 0.6) + (planPercent * 0.4));

        var firstName = profile.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? profile.FullName;

        return new EmployeeDashboardDto(
            firstName,
            profile.TargetRole?.Title ?? "Select Target Role",
            profile.BatchLabel,
            latestCompletedAttempt != null ? "Completed" : "Pending Baseline",
            latestCompletedAttempt?.CompletedAtUtc != null
                ? $"Last assessed: {latestCompletedAttempt.CompletedAtUtc.Value:MMM d, yyyy}"
                : "No assessment completed yet",
            gapsCount,
            planPercent,
            overallProgress,
            radarSkills,
            roadmapSteps,
            recommendedResources,
            upcomingActivities.Take(3).ToList());
    }

    public async Task<EmployeeSkillsOverviewDto> GetSkillsAsync(Guid userProfileId, string? category, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var allItems = await BuildEffectiveSkillItemsAsync(profile, ct);

        var filtered = string.IsNullOrWhiteSpace(category) || category.Equals("All", StringComparison.OrdinalIgnoreCase)
            ? allItems
            : allItems.Where(s => s.Category.Equals(category, StringComparison.OrdinalIgnoreCase)).ToList();

        var recentAttempts = await _db.AssessmentAttempts
            .Include(a => a.Assessment)
            .Where(a => a.UserProfileId == userProfileId && a.Status == AssessmentAttemptStatus.Completed)
            .OrderByDescending(a => a.CompletedAtUtc)
            .Take(5)
            .ToListAsync(ct);

        var recentSummaries = recentAttempts.Select(a => new RecentAssessmentSummaryDto(
            a.Id,
            a.Assessment.Title,
            a.CompletedAtUtc?.ToString("MMM d, yyyy") ?? "—",
            a.ScorePercent ?? 0,
            (a.ScorePercent ?? 0) >= a.Assessment.PassThresholdPercent)).ToList();

        var overallScore = ComputeReadinessPercentFromItems(allItems);
        var metCount = allItems.Count(s => s.GapLevel == 0);
        var gapCount = allItems.Count(s => s.GapLevel > 0);
        var deltaLabel = recentAttempts.Count >= 2
            ? $"{(recentAttempts[0].ScorePercent ?? 0) - (recentAttempts[1].ScorePercent ?? 0):+#;-#;0}% vs prior assessment"
            : recentAttempts.Count == 1
                ? "Baseline established"
                : "Take baseline assessment";

        var storedSkills = await _db.EmployeeSkills
            .Include(es => es.Skill)
            .Where(es => es.UserProfileId == userProfileId)
            .ToListAsync(ct);

        var insight = SkillGapEngine.BuildExplainableInsight(storedSkills, profile.TargetRole?.Title ?? "Target Role");

        return new EmployeeSkillsOverviewDto(
            profile.TargetRoleId,
            profile.TargetRole?.Title ?? "Select Target Role",
            overallScore,
            deltaLabel,
            metCount,
            allItems.Count,
            gapCount,
            Math.Max(0, 100 - overallScore),
            "Explainable weighted ratio: Current proficiency vs RoleSkillRequirement target scale (1-5) updated directly from verified assessment outcomes.",
            filtered,
            allItems.Take(6).Select(s => new SkillOverviewPointDto(s.Name, s.CurrentLevel, s.RequiredLevel)).ToList(),
            recentSummaries,
            insight);
    }

    public async Task<UpdateTargetRoleResponseDto> UpdateTargetRoleAsync(Guid userProfileId, UpdateTargetRoleDto request, CancellationToken ct = default)
    {
        var profile = await _db.UserProfiles.FirstOrDefaultAsync(u => u.Id == userProfileId, ct)
            ?? throw new NotFoundException(nameof(UserProfile), userProfileId);

        var role = await _db.JobRoles
            .Include(r => r.SkillRequirements)
            .FirstOrDefaultAsync(r => r.Id == request.JobRoleId, ct)
            ?? throw new NotFoundException(nameof(JobRole), request.JobRoleId);

        profile.TargetRoleId = role.Id;
        profile.DepartmentId = role.DepartmentId;
        profile.UpdatedAtUtc = DateTime.UtcNow;

        var existingSkills = await _db.EmployeeSkills
            .Where(es => es.UserProfileId == userProfileId)
            .ToListAsync(ct);

        foreach (var req in role.SkillRequirements)
        {
            var existing = existingSkills.FirstOrDefault(es => es.SkillId == req.SkillId);
            if (existing != null)
            {
                existing.TargetLevel = req.RequiredLevel;
                existing.GapScore = SkillGapEngine.ComputeGap(existing.CurrentLevel, req.RequiredLevel);
                existing.UpdatedAtUtc = DateTime.UtcNow;
            }
            else
            {
                _db.EmployeeSkills.Add(new EmployeeSkill
                {
                    UserProfileId = userProfileId,
                    SkillId = req.SkillId,
                    CurrentLevel = 1,
                    TargetLevel = req.RequiredLevel,
                    GapScore = SkillGapEngine.ComputeGap(1, req.RequiredLevel)
                });
            }
        }

        _db.ActivityLogs.Add(new ActivityLog
        {
            UserProfileId = userProfileId,
            ActorName = profile.FullName,
            Category = "Skills",
            Title = $"Target role changed to {role.Title}",
            Summary = $"Updated target role to {role.Title} and recalculated skill gaps."
        });

        await _db.SaveChangesAsync(ct);
        return new UpdateTargetRoleResponseDto(role.Title);
    }

    public async Task<AssessmentsOverviewDto> GetAssessmentsAsync(Guid userProfileId, string? status, string? search, string? category, CancellationToken ct = default)
    {
        var assessments = await _db.Assessments
            .Include(a => a.JobRole)
            .Include(a => a.Questions)
            .OrderBy(a => a.ScheduledDueDateUtc ?? DateTime.MaxValue)
            .ThenBy(a => a.Title)
            .ToListAsync(ct);

        var attempts = await _db.AssessmentAttempts
            .Where(att => att.UserProfileId == userProfileId)
            .OrderByDescending(att => att.CreatedAtUtc)
            .ToListAsync(ct);

        var items = new List<AssessmentListItemDto>();
        foreach (var assessment in assessments)
        {
            var latestAttempt = attempts.FirstOrDefault(a => a.AssessmentId == assessment.Id);
            var effectiveStatus = latestAttempt?.Status switch
            {
                AssessmentAttemptStatus.Completed => "Completed",
                AssessmentAttemptStatus.InProgress => "Pending",
                _ => assessment.ScheduledDueDateUtc.HasValue && assessment.ScheduledDueDateUtc.Value > DateTime.UtcNow.AddDays(14)
                    ? "Upcoming"
                    : "Pending"
            };

            var dateLabel = effectiveStatus == "Completed"
                ? (latestAttempt?.CompletedAtUtc?.ToString("MMM d, yyyy") ?? "Completed")
                : (assessment.ScheduledDueDateUtc?.ToString("MMM d, yyyy") ?? "Self-paced");
            var dateCaption = effectiveStatus == "Completed" ? "Completed on" : "Target date";

            var durationOrScoreLabel = effectiveStatus == "Completed"
                ? $"{latestAttempt?.ScorePercent ?? 0}%"
                : $"{assessment.DurationMinutes} mins";
            var durationOrScoreCaption = effectiveStatus == "Completed" ? "Score achieved" : "Estimated time";

            items.Add(new AssessmentListItemDto(
                assessment.Id,
                latestAttempt?.Id,
                assessment.Title,
                assessment.Subtitle,
                assessment.Category,
                dateLabel,
                dateCaption,
                durationOrScoreLabel,
                durationOrScoreCaption,
                effectiveStatus,
                latestAttempt?.ScorePercent));
        }

        var completedCount = items.Count(i => i.Status == "Completed");
        var pendingCount = items.Count(i => i.Status == "Pending");
        var upcomingCount = items.Count(i => i.Status == "Upcoming");

        var nextAssessment = items.FirstOrDefault(i => i.Status != "Completed");

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            items = items.Where(i => i.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
        }
        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            items = items.Where(i => i.Category.Equals(category, StringComparison.OrdinalIgnoreCase)).ToList();
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            items = items.Where(i =>
                i.Title.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                i.Subtitle.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return new AssessmentsOverviewDto(
            nextAssessment?.Title,
            nextAssessment?.DateLabel,
            completedCount + pendingCount + upcomingCount,
            completedCount,
            pendingCount,
            upcomingCount,
            items);
    }

    public async Task<AssessmentSessionDto> StartAssessmentAsync(Guid userProfileId, Guid assessmentId, CancellationToken ct = default)
    {
        var assessment = await _db.Assessments
            .Include(a => a.Questions)
                .ThenInclude(q => q.Skill)
            .FirstOrDefaultAsync(a => a.Id == assessmentId, ct)
            ?? throw new NotFoundException(nameof(Assessment), assessmentId);

        var attempt = new AssessmentAttempt
        {
            AssessmentId = assessment.Id,
            UserProfileId = userProfileId,
            Status = AssessmentAttemptStatus.InProgress,
            StartedAtUtc = DateTime.UtcNow
        };
        _db.AssessmentAttempts.Add(attempt);
        await _db.SaveChangesAsync(ct);

        var questions = assessment.Questions
            .OrderBy(q => q.Id)
            .Select(q =>
            {
                var options = JsonSerializer.Deserialize<List<string>>(q.OptionsJson) ?? new List<string>();
                return new AssessmentQuestionDto(q.Id, q.Skill.Name, q.Prompt, options);
            })
            .ToList();

        return new AssessmentSessionDto(attempt.Id, assessment.Id, assessment.Title, assessment.DurationMinutes, questions);
    }

    public async Task<AssessmentResultDto> SubmitAssessmentAsync(Guid userProfileId, Guid assessmentId, SubmitAssessmentRequestDto request, CancellationToken ct = default)
    {
        var attempt = await _db.AssessmentAttempts
            .Include(a => a.Assessment)
                .ThenInclude(ass => ass.Questions)
                    .ThenInclude(q => q.Skill)
            .FirstOrDefaultAsync(a => a.Id == request.AttemptId && a.UserProfileId == userProfileId && a.AssessmentId == assessmentId, ct)
            ?? throw new NotFoundException(nameof(AssessmentAttempt), request.AttemptId);

        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var questions = attempt.Assessment.Questions.ToList();
        if (questions.Count == 0)
        {
            throw new DomainException("Assessment contains no questions.");
        }

        var answerLookup = request.Answers.ToDictionary(a => a.QuestionId, a => a.SelectedOptionIndex);
        int totalWeight = 0;
        int earnedWeight = 0;

        foreach (var q in questions)
        {
            var selected = answerLookup.TryGetValue(q.Id, out var idx) ? idx : -1;
            var isCorrect = selected == q.CorrectOptionIndex;
            totalWeight += q.Weight;
            if (isCorrect) earnedWeight += q.Weight;

            _db.AssessmentAnswers.Add(new AssessmentAnswer
            {
                AttemptId = attempt.Id,
                QuestionId = q.Id,
                SelectedOptionIndex = selected,
                IsCorrect = isCorrect
            });
        }

        var overallPercent = totalWeight == 0 ? 0 : (int)Math.Round((double)earnedWeight / totalWeight * 100.0);
        attempt.ScorePercent = overallPercent;
        attempt.Status = AssessmentAttemptStatus.Completed;
        attempt.CompletedAtUtc = DateTime.UtcNow;
        attempt.UpdatedAtUtc = DateTime.UtcNow;

        var roleReqs = profile.TargetRoleId.HasValue
            ? await _db.RoleSkillRequirements.Where(r => r.JobRoleId == profile.TargetRoleId.Value).ToListAsync(ct)
            : new List<RoleSkillRequirement>();

        var existingEmployeeSkills = await _db.EmployeeSkills
            .Where(es => es.UserProfileId == userProfileId)
            .ToListAsync(ct);

        var breakdown = new List<SkillBreakdownResultDto>();
        foreach (var skillGroup in questions.GroupBy(q => q.SkillId))
        {
            var skill = skillGroup.First().Skill;
            var groupCount = skillGroup.Count();
            var correctCount = skillGroup.Count(q => answerLookup.TryGetValue(q.Id, out var sel) && sel == q.CorrectOptionIndex);
            var skillPercent = (int)Math.Round((double)correctCount / groupCount * 100.0);
            var newLevel = SkillGapEngine.ComputeLevelFromPercentage(skillPercent);
            var targetLevel = roleReqs.FirstOrDefault(r => r.SkillId == skillGroup.Key)?.RequiredLevel ?? 4;
            var gap = SkillGapEngine.ComputeGap(newLevel, targetLevel);

            var existing = existingEmployeeSkills.FirstOrDefault(es => es.SkillId == skillGroup.Key);
            if (existing != null)
            {
                existing.CurrentLevel = newLevel;
                existing.TargetLevel = targetLevel;
                existing.GapScore = gap;
                existing.LastAssessedAtUtc = DateTime.UtcNow;
                existing.UpdatedAtUtc = DateTime.UtcNow;
            }
            else
            {
                _db.EmployeeSkills.Add(new EmployeeSkill
                {
                    UserProfileId = userProfileId,
                    SkillId = skillGroup.Key,
                    CurrentLevel = newLevel,
                    TargetLevel = targetLevel,
                    GapScore = gap,
                    LastAssessedAtUtc = DateTime.UtcNow
                });
            }

            breakdown.Add(new SkillBreakdownResultDto(skill.Name, correctCount, groupCount, newLevel, targetLevel));
        }

        // Unlock relevant achievements
        await TryUnlockAchievementAsync(userProfileId, "FIRST_ASSESSMENT", ct);
        if (overallPercent >= 80)
        {
            await TryUnlockAchievementAsync(userProfileId, "HIGH_SCORER", ct);
        }

        _db.ActivityLogs.Add(new ActivityLog
        {
            UserProfileId = userProfileId,
            ActorName = profile.FullName,
            Category = "Assessment",
            Title = $"{attempt.Assessment.Title} completed",
            Summary = $"Completed {attempt.Assessment.Title} with {overallPercent}% score."
        });

        _db.Notifications.Add(new Notification
        {
            UserProfileId = userProfileId,
            Category = NotificationCategory.Assessment,
            Title = $"Assessment Graded: {attempt.Assessment.Title}",
            Message = $"You scored {overallPercent}%. Your skill matrix and gaps have been updated.",
            ActionLabel = "View My Skills",
            ActionRoute = "/employee/skills"
        });

        await _db.SaveChangesAsync(ct);

        return new AssessmentResultDto(
            attempt.Id,
            attempt.Assessment.Title,
            overallPercent,
            overallPercent >= attempt.Assessment.PassThresholdPercent,
            attempt.CompletedAtUtc.Value,
            breakdown);
    }

    public async Task<AssessmentResultDto> GetAssessmentResultAsync(Guid userProfileId, Guid attemptId, CancellationToken ct = default)
    {
        var attempt = await _db.AssessmentAttempts
            .Include(a => a.Assessment)
            .Include(a => a.Answers)
                .ThenInclude(ans => ans.Question)
                    .ThenInclude(q => q.Skill)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.UserProfileId == userProfileId, ct)
            ?? throw new NotFoundException(nameof(AssessmentAttempt), attemptId);

        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var employeeSkills = await _db.EmployeeSkills
            .Where(es => es.UserProfileId == userProfileId)
            .ToListAsync(ct);
        var roleReqs = profile.TargetRoleId.HasValue
            ? await _db.RoleSkillRequirements.Where(r => r.JobRoleId == profile.TargetRoleId.Value).ToListAsync(ct)
            : new List<RoleSkillRequirement>();

        var breakdown = attempt.Answers
            .GroupBy(a => a.Question.SkillId)
            .Select(g =>
            {
                var skillName = g.First().Question.Skill.Name;
                var correct = g.Count(x => x.IsCorrect);
                var total = g.Count();
                var currentLevel = employeeSkills.FirstOrDefault(es => es.SkillId == g.Key)?.CurrentLevel
                    ?? SkillGapEngine.ComputeLevelFromPercentage((int)Math.Round((double)correct / total * 100.0));
                var required = roleReqs.FirstOrDefault(r => r.SkillId == g.Key)?.RequiredLevel ?? 4;
                return new SkillBreakdownResultDto(skillName, correct, total, currentLevel, required);
            })
            .ToList();

        var score = attempt.ScorePercent ?? 0;
        return new AssessmentResultDto(
            attempt.Id,
            attempt.Assessment.Title,
            score,
            score >= attempt.Assessment.PassThresholdPercent,
            attempt.CompletedAtUtc ?? DateTime.UtcNow,
            breakdown);
    }

    public async Task<LearningPlanOverviewDto> GetLearningPlanAsync(Guid userProfileId, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var activePlan = await GetLatestEmployeePlanAsync(userProfileId, ct);

        if (activePlan == null)
        {
            return new LearningPlanOverviewDto(
                false,
                null,
                "No Active Learning Plan",
                profile.TargetRole?.Title ?? "Target Role",
                0,
                "Not generated yet",
                0,
                0,
                "Generate an AI-personalized roadmap from your skill gaps",
                $"Reach {profile.TargetRole?.Title ?? "Role"} readiness",
                false,
                new List<RoadmapStepSummaryDto>(),
                new List<ResourceCardDto>());
        }

        return await BuildLearningPlanOverviewAsync(profile, activePlan, ct);
    }

    public async Task<LearningPlanOverviewDto> GenerateLearningPlanAsync(Guid userProfileId, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var effectiveSkills = await BuildEffectiveSkillItemsAsync(profile, ct);
        var allSkills = await _db.Skills.ToListAsync(ct);

        var gapInputs = effectiveSkills
            .Select(s => new AiSkillGapInputDto(s.Name, s.CurrentLevel, s.RequiredLevel, s.GapLevel))
            .ToList();

        var aiResponse = await _aiClient.GenerateLearningPlanAsync(new AiGeneratePlanRequestDto(
            profile.FullName,
            profile.TargetRole?.Title ?? "Software Developer",
            gapInputs,
            allSkills.Select(s => s.Name).ToList()), ct);

        var targetRoleId = profile.TargetRoleId
            ?? (await _db.JobRoles.OrderBy(r => r.Title).FirstAsync(ct)).Id;

        var plan = new LearningPlan
        {
            Title = aiResponse.PlanTitle,
            TargetRoleId = targetRoleId,
            IsAiGenerated = true,
            EstimatedWeeks = Math.Max(1, aiResponse.EstimatedWeeks),
            GoalLabel = aiResponse.GoalLabel,
            CreatedByUserProfileId = userProfileId
        };
        _db.LearningPlans.Add(plan);

        var defaultSkill = allSkills.First();
        var modules = new List<LearningModule>();
        int idx = 1;
        foreach (var mod in aiResponse.Modules)
        {
            var matchedSkill = allSkills.FirstOrDefault(s =>
                s.Name.Equals(mod.SkillName, StringComparison.OrdinalIgnoreCase) ||
                s.Name.Contains(mod.SkillName, StringComparison.OrdinalIgnoreCase)) ?? defaultSkill;

            var entity = new LearningModule
            {
                LearningPlanId = plan.Id,
                SkillId = matchedSkill.Id,
                OrderIndex = idx++,
                Title = mod.Title,
                Description = mod.Description,
                EstimatedHours = mod.EstimatedHours > 0 ? mod.EstimatedHours : 2.0m
            };
            modules.Add(entity);
            _db.LearningModules.Add(entity);
        }

        var empPlan = new EmployeeLearningPlan
        {
            UserProfileId = userProfileId,
            LearningPlanId = plan.Id,
            ProgressPercent = 0,
            DueDateUtc = DateTime.UtcNow.AddDays(plan.EstimatedWeeks * 7)
        };
        _db.EmployeeLearningPlans.Add(empPlan);

        foreach (var module in modules)
        {
            _db.EmployeeModuleProgresses.Add(new EmployeeModuleProgress
            {
                EmployeeLearningPlanId = empPlan.Id,
                LearningModuleId = module.Id,
                Status = module.OrderIndex == 1 ? ModuleProgressStatus.InProgress : ModuleProgressStatus.NotStarted
            });
        }

        _db.ActivityLogs.Add(new ActivityLog
        {
            UserProfileId = userProfileId,
            ActorName = profile.FullName,
            Category = "Learning",
            Title = $"AI Learning Plan generated",
            Summary = $"Generated personalized roadmap '{plan.Title}' with {modules.Count} modules."
        });

        _db.Notifications.Add(new Notification
        {
            UserProfileId = userProfileId,
            Category = NotificationCategory.Learning,
            Title = "AI Learning Plan Ready",
            Message = $"Your personalized plan '{plan.Title}' ({modules.Count} modules) is ready to start.",
            ActionLabel = "Open Learning Plan",
            ActionRoute = "/employee/learning-plan"
        });

        await _db.SaveChangesAsync(ct);

        var loaded = await GetLatestEmployeePlanAsync(userProfileId, ct);
        return await BuildLearningPlanOverviewAsync(profile, loaded!, ct);
    }

    public async Task<LearningPlanOverviewDto> UpdateModuleStatusAsync(Guid userProfileId, Guid moduleId, UpdateModuleStatusDto request, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var activePlan = await GetLatestEmployeePlanAsync(userProfileId, ct)
            ?? throw new NotFoundException(nameof(EmployeeLearningPlan), userProfileId);

        var modProgress = activePlan.ModuleProgresses.FirstOrDefault(mp => mp.LearningModuleId == moduleId)
            ?? throw new NotFoundException(nameof(EmployeeModuleProgress), moduleId);

        if (!Enum.TryParse<ModuleProgressStatus>(request.Status, true, out var parsedStatus))
        {
            throw new ValidationDomainException("status", "Status must be InProgress or Completed.");
        }

        modProgress.Status = parsedStatus;
        modProgress.CompletedAtUtc = parsedStatus == ModuleProgressStatus.Completed ? DateTime.UtcNow : null;
        modProgress.UpdatedAtUtc = DateTime.UtcNow;

        var total = Math.Max(1, activePlan.ModuleProgresses.Count);
        var completed = activePlan.ModuleProgresses.Count(mp => mp.Status == ModuleProgressStatus.Completed);
        activePlan.ProgressPercent = (int)Math.Round((double)completed / total * 100.0);
        activePlan.UpdatedAtUtc = DateTime.UtcNow;

        if (parsedStatus == ModuleProgressStatus.Completed)
        {
            await TryUnlockAchievementAsync(userProfileId, "FAST_LEARNER", ct);
            if (activePlan.ProgressPercent >= 100)
            {
                await TryUnlockAchievementAsync(userProfileId, "PLAN_FINISHER", ct);
            }

            _db.ActivityLogs.Add(new ActivityLog
            {
                UserProfileId = userProfileId,
                ActorName = profile.FullName,
                Category = "Learning",
                Title = $"Completed module: {modProgress.LearningModule.Title}",
                Summary = $"Completed module '{modProgress.LearningModule.Title}' ({activePlan.ProgressPercent}% plan progress)."
            });
        }

        await _db.SaveChangesAsync(ct);
        return await BuildLearningPlanOverviewAsync(profile, activePlan, ct);
    }

    public async Task<ResourcesOverviewDto> GetResourcesAsync(Guid userProfileId, string? search, string? category, string? resourceType, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var effectiveSkills = await BuildEffectiveSkillItemsAsync(profile, ct);
        var gapSkills = effectiveSkills.Where(s => s.GapLevel > 0).ToList();

        var resources = await _db.TrainingResources
            .Include(r => r.Skill)
            .ToListAsync(ct);

        IEnumerable<TrainingResource> filtered = resources;
        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            filtered = filtered.Where(r => r.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        }
        if (!string.IsNullOrWhiteSpace(resourceType) && !resourceType.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            filtered = filtered.Where(r => r.ResourceType.ToString().Equals(resourceType, StringComparison.OrdinalIgnoreCase));
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            filtered = filtered.Where(r =>
                r.Title.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                r.Description.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                r.Skill.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var filteredList = filtered.ToList();
        var gapSet = gapSkills.Select(g => g.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);

        Dictionary<Guid, string> aiReasons = new();
        if (gapSkills.Count > 0 && filteredList.Count > 0)
        {
            var aiResult = await _aiClient.RecommendResourcesAsync(new AiResourceRecommendationRequestDto(
                profile.TargetRole?.Title ?? "Target Role",
                gapSkills.Select(g => new AiSkillGapInputDto(g.Name, g.CurrentLevel, g.RequiredLevel, g.GapLevel)).ToList(),
                filteredList.Select(r => new AiResourceCatalogItemDto(r.Id, r.Title, r.Skill.Name, r.ResourceType.ToString(), r.Difficulty)).ToList()
            ), ct);

            foreach (var rec in aiResult.Recommendations)
            {
                aiReasons[rec.Id] = rec.Reason;
            }
        }

        var cards = filteredList
            .OrderByDescending(r => aiReasons.ContainsKey(r.Id))
            .ThenByDescending(r => gapSet.Contains(r.Skill.Name))
            .ThenBy(r => r.Title)
            .Select(r => MapResourceCard(
                r,
                aiReasons.ContainsKey(r.Id) || gapSet.Contains(r.Skill.Name),
                aiReasons.TryGetValue(r.Id, out var reason) ? reason : null))
            .ToList();

        var featured = cards.Take(4).ToList();
        var recommended = cards.Skip(4).Take(8).ToList();
        if (recommended.Count == 0 && cards.Count > 0)
        {
            recommended = cards.Where(c => c.IsRecommended).Take(4).ToList();
        }

        return new ResourcesOverviewDto(
            $"Reach {profile.TargetRole?.Title ?? "Role"} Proficiency",
            featured,
            recommended);
    }

    public async Task<EmployeeProgressDto> GetProgressAsync(Guid userProfileId, string range, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var skills = await BuildEffectiveSkillItemsAsync(profile, ct);

        var totalAssessments = await _db.Assessments.CountAsync(ct);
        var completedAttempts = await _db.AssessmentAttempts
            .Where(a => a.UserProfileId == userProfileId && a.Status == AssessmentAttemptStatus.Completed)
            .OrderBy(a => a.CompletedAtUtc)
            .ToListAsync(ct);

        var activePlan = await GetLatestEmployeePlanAsync(userProfileId, ct);
        var learningHours = activePlan == null
            ? 0m
            : activePlan.ModuleProgresses
                .Where(mp => mp.Status == ModuleProgressStatus.Completed)
                .Sum(mp => mp.LearningModule.EstimatedHours);

        var readiness = ComputeReadinessPercentFromItems(skills);
        var planPercent = activePlan?.ProgressPercent ?? 0;
        var overallProgress = completedAttempts.Count == 0 && activePlan == null
            ? 0
            : (int)Math.Round((readiness * 0.6) + (planPercent * 0.4));

        var cutoff = range switch
        {
            "3M" => DateTime.UtcNow.AddMonths(-3),
            "6M" => DateTime.UtcNow.AddMonths(-6),
            "1Y" => DateTime.UtcNow.AddYears(-1),
            _ => DateTime.UtcNow.AddMonths(-1)
        };

        var series = completedAttempts
            .Where(a => (a.CompletedAtUtc ?? a.CreatedAtUtc) >= cutoff)
            .Select(a => new ProgressPointDto(
                (a.CompletedAtUtc ?? a.CreatedAtUtc).ToString("MMM d"),
                a.ScorePercent ?? 0))
            .ToList();

        var skillBars = skills
            .Select(s => new SkillPerformanceBarDto(
                s.Name,
                (int)Math.Round((double)Math.Min(s.CurrentLevel, s.RequiredLevel) / Math.Max(1, s.RequiredLevel) * 100.0)))
            .ToList();

        var allAchievements = await _db.Achievements.OrderBy(a => a.Title).ToListAsync(ct);
        var unlocked = await _db.EmployeeAchievements
            .Where(ea => ea.UserProfileId == userProfileId)
            .ToListAsync(ct);

        var badges = allAchievements.Select(a =>
        {
            var match = unlocked.FirstOrDefault(u => u.AchievementId == a.Id);
            return new AchievementBadgeDto(
                a.Id,
                a.Title,
                match != null,
                match?.UnlockedAtUtc.ToString("MMM d, yyyy"));
        }).ToList();

        var activities = await _db.ActivityLogs
            .Where(l => l.UserProfileId == userProfileId)
            .OrderByDescending(l => l.CreatedAtUtc)
            .Take(6)
            .ToListAsync(ct);

        var activityItems = activities
            .Select(a => new ActivityFeedItemDto(a.Id, a.Summary, FormatRelativeTime(a.CreatedAtUtc)))
            .ToList();

        return new EmployeeProgressDto(
            overallProgress,
            completedAttempts.Count,
            totalAssessments,
            skills.Count(s => s.CurrentLevel >= 3),
            learningHours,
            series,
            skillBars,
            badges,
            activityItems);
    }

    public async Task<AiChatSessionDto> GetChatSessionAsync(Guid userProfileId, string mode, CancellationToken ct = default)
    {
        var normalizedMode = string.IsNullOrWhiteSpace(mode) ? "Ask a Question" : mode.Trim();
        var session = await _db.AiChatSessions
            .Include(s => s.Messages.OrderBy(m => m.CreatedAtUtc))
            .FirstOrDefaultAsync(s => s.UserProfileId == userProfileId && s.Mode == normalizedMode, ct);

        if (session == null)
        {
            session = new AiChatSession
            {
                UserProfileId = userProfileId,
                Mode = normalizedMode
            };
            _db.AiChatSessions.Add(session);
            await _db.SaveChangesAsync(ct);
        }

        var msgs = session.Messages
            .OrderBy(m => m.CreatedAtUtc)
            .Select(m => new AiChatMessageDto(
                m.Id,
                m.Sender,
                m.Content,
                m.CodeSnippet,
                m.CreatedAtUtc.ToString("h:mm tt"),
                null))
            .ToList();

        return new AiChatSessionDto(session.Id, session.Mode, msgs);
    }

    public async Task<SendChatMessageResponseDto> SendChatMessageAsync(Guid userProfileId, SendChatMessageRequestDto request, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var mode = request.Mode.Trim();

        var session = await _db.AiChatSessions
            .Include(s => s.Messages.OrderBy(m => m.CreatedAtUtc))
            .FirstOrDefaultAsync(s => s.UserProfileId == userProfileId && s.Mode == mode, ct);

        if (session == null)
        {
            session = new AiChatSession { UserProfileId = userProfileId, Mode = mode };
            _db.AiChatSessions.Add(session);
            await _db.SaveChangesAsync(ct);
        }

        var userMsg = new AiChatMessage
        {
            AiChatSessionId = session.Id,
            Sender = "User",
            Content = request.Message.Trim()
        };
        _db.AiChatMessages.Add(userMsg);

        var skills = await BuildEffectiveSkillItemsAsync(profile, ct);
        var history = session.Messages
            .OrderBy(m => m.CreatedAtUtc)
            .TakeLast(8)
            .Select(m => new AiChatTurnDto(m.Sender, m.Content))
            .ToList();

        var aiReply = await _aiClient.ChatAsync(new AiChatRequestDto(
            mode,
            request.Message.Trim(),
            profile.FullName,
            profile.TargetRole?.Title ?? "Software Developer",
            skills.Select(s => new AiSkillGapInputDto(s.Name, s.CurrentLevel, s.RequiredLevel, s.GapLevel)).ToList(),
            history), ct);

        var assistantMsg = new AiChatMessage
        {
            AiChatSessionId = session.Id,
            Sender = "Assistant",
            Content = aiReply.Reply,
            CodeSnippet = aiReply.CodeSnippet
        };
        _db.AiChatMessages.Add(assistantMsg);
        await _db.SaveChangesAsync(ct);

        return new SendChatMessageResponseDto(
            new AiChatMessageDto(userMsg.Id, "User", userMsg.Content, null, userMsg.CreatedAtUtc.ToString("h:mm tt"), null),
            new AiChatMessageDto(assistantMsg.Id, "Assistant", assistantMsg.Content, assistantMsg.CodeSnippet, assistantMsg.CreatedAtUtc.ToString("h:mm tt"), null));
    }

    public async Task<PaginatedResultDto<NotificationItemDto>> GetNotificationsAsync(Guid userProfileId, string? category, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _db.Notifications.Where(n => n.UserProfileId == userProfileId);

        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            if (category.Equals("Unread", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(n => !n.IsRead);
            }
            else if (Enum.TryParse<NotificationCategory>(category, true, out var catEnum))
            {
                query = query.Where(n => n.Category == catEnum);
            }
        }

        var totalCount = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(n => n.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = rows.Select(n => new NotificationItemDto(
            n.Id,
            n.Category.ToString(),
            n.Title,
            n.Message,
            FormatRelativeTime(n.CreatedAtUtc),
            n.CreatedAtUtc.ToString("MMM d, yyyy"),
            n.IsRead,
            n.ActionLabel,
            n.ActionRoute)).ToList();

        var totalPages = Math.Max(1, (int)Math.Ceiling((double)totalCount / pageSize));
        return new PaginatedResultDto<NotificationItemDto>(items, totalCount, page, pageSize, totalPages);
    }

    public async Task MarkNotificationReadAsync(Guid userProfileId, Guid notificationId, CancellationToken ct = default)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserProfileId == userProfileId, ct)
            ?? throw new NotFoundException(nameof(Notification), notificationId);

        notification.IsRead = true;
        notification.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<UserSettingsDto> GetSettingsAsync(Guid userProfileId, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var settings = await EnsureSettingsAsync(userProfileId, ct);
        return MapSettingsDto(profile, settings);
    }

    public async Task<UserSettingsDto> UpdateProfileAsync(Guid userProfileId, UpdateProfileRequestDto request, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        profile.FullName = request.FullName.Trim();
        profile.PhoneNumber = request.PhoneNumber?.Trim();
        profile.Location = request.Location?.Trim();
        if (!string.IsNullOrWhiteSpace(request.JobTitle))
        {
            profile.JobTitle = request.JobTitle.Trim();
        }
        profile.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        var settings = await EnsureSettingsAsync(userProfileId, ct);
        return MapSettingsDto(profile, settings);
    }

    public async Task<UserSettingsDto> UpdateSettingsAsync(Guid userProfileId, UpdateSettingsRequestDto request, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var settings = await EnsureSettingsAsync(userProfileId, ct);

        if (request.AssessmentReminders.HasValue) settings.AssessmentReminders = request.AssessmentReminders.Value;
        if (request.LearningPlanUpdates.HasValue) settings.LearningPlanUpdates = request.LearningPlanUpdates.Value;
        if (request.TrainingDeadlineAlerts.HasValue) settings.TrainingDeadlineAlerts = request.TrainingDeadlineAlerts.Value;
        if (request.SystemAnnouncements.HasValue) settings.SystemAnnouncements = request.SystemAnnouncements.Value;
        if (request.EmailNotifications.HasValue) settings.EmailNotifications = request.EmailNotifications.Value;
        if (request.MonthlyReportDelivery.HasValue) settings.MonthlyReportDelivery = request.MonthlyReportDelivery.Value;
        if (!string.IsNullOrWhiteSpace(request.Theme)) settings.Theme = request.Theme;
        if (!string.IsNullOrWhiteSpace(request.Language)) settings.Language = request.Language;
        if (!string.IsNullOrWhiteSpace(request.TimeZone)) settings.TimeZone = request.TimeZone;
        if (!string.IsNullOrWhiteSpace(request.DefaultTeamView)) settings.DefaultTeamView = request.DefaultTeamView;
        if (request.TwoFactorEnabled.HasValue) profile.TwoFactorEnabled = request.TwoFactorEnabled.Value;

        settings.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return MapSettingsDto(profile, settings);
    }

    public async Task<MessageResponseDto> ChangePasswordAsync(Guid identityUserId, ChangePasswordRequestDto request, CancellationToken ct = default)
    {
        var (succeeded, errors) = await _identity.ChangePasswordAsync(identityUserId, request.CurrentPassword, request.NewPassword, ct);
        if (!succeeded)
        {
            throw new ValidationDomainException("currentPassword", string.Join(" ", errors));
        }
        return new MessageResponseDto("Password updated successfully.");
    }

    public async Task<List<ActiveSessionDto>> GetActiveSessionsAsync(Guid userProfileId, CancellationToken ct = default)
    {
        var tokens = await _db.RefreshTokens
            .Where(r => r.UserProfileId == userProfileId && r.RevokedAtUtc == null && r.ExpiresAtUtc > DateTime.UtcNow)
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync(ct);

        return tokens.Select((t, idx) => new ActiveSessionDto(t.Id, t.CreatedAtUtc, t.ExpiresAtUtc, idx == 0)).ToList();
    }

    public async Task<byte[]> ExportMyDataAsync(Guid userProfileId, CancellationToken ct = default)
    {
        var profile = await GetProfileWithRoleAsync(userProfileId, ct);
        var skills = await BuildEffectiveSkillItemsAsync(profile, ct);
        var assessments = await _db.AssessmentAttempts
            .Include(a => a.Assessment)
            .Where(a => a.UserProfileId == userProfileId)
            .ToListAsync(ct);

        var payload = new
        {
            ExportedAtUtc = DateTime.UtcNow,
            Profile = new
            {
                profile.FullName,
                profile.Email,
                profile.EmployeeCode,
                Department = profile.Department?.Name,
                TargetRole = profile.TargetRole?.Title
            },
            Skills = skills,
            AssessmentAttempts = assessments.Select(a => new
            {
                a.Assessment.Title,
                Status = a.Status.ToString(),
                a.ScorePercent,
                a.CompletedAtUtc
            })
        };

        return Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true }));
    }

    public async Task DeleteAccountAsync(Guid userProfileId, CancellationToken ct = default)
    {
        var profile = await _db.UserProfiles.FirstOrDefaultAsync(u => u.Id == userProfileId, ct)
            ?? throw new NotFoundException(nameof(UserProfile), userProfileId);

        var identityId = profile.IdentityUserId;
        _db.UserProfiles.Remove(profile);
        await _db.SaveChangesAsync(ct);
        await _identity.DeleteIdentityUserAsync(identityId, ct);
    }

    // --- Private Helpers ---

    private async Task<UserProfile> GetProfileWithRoleAsync(Guid userProfileId, CancellationToken ct)
    {
        return await _db.UserProfiles
            .Include(u => u.Department)
            .Include(u => u.TargetRole)
            .FirstOrDefaultAsync(u => u.Id == userProfileId, ct)
            ?? throw new NotFoundException(nameof(UserProfile), userProfileId);
    }

    private async Task<UserSettings> EnsureSettingsAsync(Guid userProfileId, CancellationToken ct)
    {
        var settings = await _db.UserSettings.FirstOrDefaultAsync(s => s.UserProfileId == userProfileId, ct);
        if (settings == null)
        {
            settings = new UserSettings { UserProfileId = userProfileId };
            _db.UserSettings.Add(settings);
            await _db.SaveChangesAsync(ct);
        }
        return settings;
    }

    private async Task<EmployeeLearningPlan?> GetLatestEmployeePlanAsync(Guid userProfileId, CancellationToken ct)
    {
        return await _db.EmployeeLearningPlans
            .Include(p => p.LearningPlan)
                .ThenInclude(lp => lp.TargetRole)
            .Include(p => p.ModuleProgresses)
                .ThenInclude(mp => mp.LearningModule)
                    .ThenInclude(m => m.Skill)
            .Where(p => p.UserProfileId == userProfileId)
            .OrderByDescending(p => p.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);
    }

    private async Task<LearningPlanOverviewDto> BuildLearningPlanOverviewAsync(UserProfile profile, EmployeeLearningPlan activePlan, CancellationToken ct)
    {
        var steps = MapRoadmapSteps(activePlan);
        var completedCount = steps.Count(s => s.Status == "Completed");
        var statusLabel = completedCount == steps.Count && steps.Count > 0
            ? "Completed"
            : completedCount > 0 ? "In Progress" : "Not Started";

        var moduleSkillIds = activePlan.ModuleProgresses.Select(mp => mp.LearningModule.SkillId).Distinct().ToList();
        var resources = await _db.TrainingResources
            .Include(r => r.Skill)
            .Where(r => moduleSkillIds.Contains(r.SkillId))
            .Take(4)
            .ToListAsync(ct);

        var resourceCards = resources.Select(r => MapResourceCard(r, true, $"Supports {r.Skill.Name} module")).ToList();

        return new LearningPlanOverviewDto(
            true,
            activePlan.Id,
            activePlan.LearningPlan.Title,
            activePlan.LearningPlan.TargetRole?.Title ?? profile.TargetRole?.Title ?? "Role Readiness",
            activePlan.ProgressPercent,
            statusLabel,
            completedCount,
            steps.Count,
            $"{activePlan.LearningPlan.EstimatedWeeks} Weeks",
            activePlan.LearningPlan.GoalLabel,
            activePlan.LearningPlan.IsAiGenerated,
            steps,
            resourceCards);
    }

    private static List<RoadmapStepSummaryDto> MapRoadmapSteps(EmployeeLearningPlan activePlan)
    {
        return activePlan.ModuleProgresses
            .OrderBy(mp => mp.LearningModule.OrderIndex)
            .Select(mp =>
            {
                var status = mp.Status switch
                {
                    ModuleProgressStatus.Completed => "Completed",
                    ModuleProgressStatus.InProgress => "InProgress",
                    ModuleProgressStatus.Locked => "Locked",
                    _ => "Upcoming"
                };

                var dueLabel = activePlan.DueDateUtc.HasValue
                    ? activePlan.DueDateUtc.Value.ToString("MMM d, yyyy")
                    : null;

                return new RoadmapStepSummaryDto(
                    mp.LearningModuleId,
                    mp.LearningModule.OrderIndex,
                    mp.LearningModule.Title,
                    mp.LearningModule.Description,
                    dueLabel,
                    mp.LearningModule.EstimatedHours,
                    status);
            }).ToList();
    }

    private async Task<List<EmployeeSkillItemDto>> BuildEffectiveSkillItemsAsync(UserProfile profile, CancellationToken ct)
    {
        var employeeSkills = await _db.EmployeeSkills
            .Include(es => es.Skill)
            .Where(es => es.UserProfileId == profile.Id)
            .ToListAsync(ct);

        var targetRoleId = profile.TargetRoleId
            ?? (await _db.JobRoles.OrderBy(r => r.Title).FirstOrDefaultAsync(ct))?.Id;

        var requirements = targetRoleId.HasValue
            ? await _db.RoleSkillRequirements
                .Include(r => r.Skill)
                .Where(r => r.JobRoleId == targetRoleId.Value)
                .ToListAsync(ct)
            : new List<RoleSkillRequirement>();

        var result = new List<EmployeeSkillItemDto>();
        foreach (var req in requirements)
        {
            var es = employeeSkills.FirstOrDefault(x => x.SkillId == req.SkillId);
            var current = es?.CurrentLevel ?? 1;
            var gap = SkillGapEngine.ComputeGap(current, req.RequiredLevel);
            result.Add(new EmployeeSkillItemDto(
                req.SkillId,
                req.Skill.Code,
                req.Skill.Name,
                req.Skill.Category.ToString(),
                current,
                req.RequiredLevel,
                gap,
                gap == 0 ? "Met" : "Gap"));
        }

        foreach (var extra in employeeSkills.Where(es => requirements.All(r => r.SkillId != es.SkillId)))
        {
            result.Add(new EmployeeSkillItemDto(
                extra.SkillId,
                extra.Skill.Code,
                extra.Skill.Name,
                extra.Skill.Category.ToString(),
                extra.CurrentLevel,
                extra.TargetLevel,
                extra.GapScore,
                extra.GapScore == 0 ? "Met" : "Gap"));
        }

        return result.OrderByDescending(s => s.GapLevel).ThenBy(s => s.Name).ToList();
    }

    private static int ComputeReadinessPercentFromItems(List<EmployeeSkillItemDto> items)
    {
        if (items.Count == 0) return 0;
        var totalReq = items.Sum(i => Math.Max(1, i.RequiredLevel));
        var totalAchieved = items.Sum(i => Math.Min(i.CurrentLevel, i.RequiredLevel));
        return (int)Math.Round((double)totalAchieved / totalReq * 100.0);
    }

    private static ResourceCardDto MapResourceCard(TrainingResource r, bool isRecommended, string? reason)
    {
        return new ResourceCardDto(
            r.Id,
            r.Title,
            r.Description,
            r.Provider,
            r.Category,
            r.ResourceType.ToString(),
            r.Difficulty,
            r.DurationLabel,
            r.Url,
            r.Skill.Name,
            isRecommended,
            reason);
    }

    private async Task TryUnlockAchievementAsync(Guid userProfileId, string code, CancellationToken ct)
    {
        var achievement = await _db.Achievements.FirstOrDefaultAsync(a => a.Code == code, ct);
        if (achievement == null) return;

        var exists = await _db.EmployeeAchievements
            .AnyAsync(ea => ea.UserProfileId == userProfileId && ea.AchievementId == achievement.Id, ct);
        if (!exists)
        {
            _db.EmployeeAchievements.Add(new EmployeeAchievement
            {
                UserProfileId = userProfileId,
                AchievementId = achievement.Id,
                UnlockedAtUtc = DateTime.UtcNow
            });
        }
    }

    private static UserSettingsDto MapSettingsDto(UserProfile profile, UserSettings settings)
    {
        return new UserSettingsDto(
            profile.FullName,
            profile.Email,
            profile.EmployeeCode,
            profile.Department?.Name ?? "General",
            profile.PhoneNumber,
            profile.Location,
            profile.JobTitle,
            settings.AssessmentReminders,
            settings.LearningPlanUpdates,
            settings.TrainingDeadlineAlerts,
            settings.SystemAnnouncements,
            settings.EmailNotifications,
            settings.MonthlyReportDelivery,
            settings.Theme,
            settings.Language,
            settings.TimeZone,
            settings.DefaultTeamView,
            profile.TwoFactorEnabled);
    }

    private static string FormatRelativeTime(DateTime utcTime)
    {
        var diff = DateTime.UtcNow - utcTime;
        if (diff.TotalMinutes < 1) return "Just now";
        if (diff.TotalHours < 1) return $"{(int)diff.TotalMinutes}m ago";
        if (diff.TotalDays < 1) return $"{(int)diff.TotalHours}h ago";
        if (diff.TotalDays < 7) return $"{(int)diff.TotalDays}d ago";
        return utcTime.ToString("MMM d");
    }
}
