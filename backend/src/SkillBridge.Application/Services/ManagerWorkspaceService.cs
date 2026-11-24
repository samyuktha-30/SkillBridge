using Microsoft.EntityFrameworkCore;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;
using SkillBridge.Domain.Entities;
using SkillBridge.Domain.Enums;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.Application.Services;

public class ManagerWorkspaceService : IManagerWorkspaceService
{
    private readonly IApplicationDbContext _db;
    private readonly IAiServiceClient _aiClient;
    private readonly IReportExporter _reportExporter;
    private readonly IBackgroundJobScheduler _jobs;

    public ManagerWorkspaceService(
        IApplicationDbContext db,
        IAiServiceClient aiClient,
        IReportExporter reportExporter,
        IBackgroundJobScheduler jobs)
    {
        _db = db;
        _aiClient = aiClient;
        _reportExporter = reportExporter;
        _jobs = jobs;
    }

    public async Task<EmployeeAccessListDto> GetEmployeeApprovalsAsync(
    Guid managerProfileId,
    CancellationToken ct = default)
{
    var employees = await _db.UserProfiles
        .AsNoTracking()
        .Include(u => u.Department)
        .Where(u => u.Role == UserRole.Employee)
        .OrderBy(u => u.ApprovalStatus)
        .ThenBy(u => u.FullName)
        .ToListAsync(ct);

    var employeeDtos = employees.Select(u => new EmployeeAccessDto(
        u.Id,
        u.FullName,
        u.Email,
        u.Department?.Name ?? "General",
        u.ApprovalStatus.ToString()
    )).ToList();

    return new EmployeeAccessListDto(
        employees.Count,
        employees.Count(u => u.ApprovalStatus == ApprovalStatus.PendingApproval),
        employees.Count(u => u.ApprovalStatus == ApprovalStatus.Active),
        employeeDtos
    );
}

    public async Task<MessageResponseDto> UpdateEmployeeApprovalAsync(
    Guid managerProfileId,
    Guid employeeId,
    UpdateEmployeeApprovalDto request,
    CancellationToken ct = default)
{
    var employee = await _db.UserProfiles
        .FirstOrDefaultAsync(
            u => u.Id == employeeId && u.Role == UserRole.Employee,
            ct)
        ?? throw new NotFoundException(nameof(UserProfile), employeeId);

    if (request.Approve)
    {
        employee.ApprovalStatus = ApprovalStatus.Active;

        await _db.SaveChangesAsync(ct);

        return new MessageResponseDto(
            $"{employee.FullName}'s account has been approved.");
    }

    employee.ApprovalStatus = ApprovalStatus.Rejected;

    var activeTokens = await _db.RefreshTokens
        .Where(r =>
            r.UserProfileId == employeeId &&
            r.RevokedAtUtc == null)
        .ToListAsync(ct);

    foreach (var token in activeTokens)
    {
        token.RevokedAtUtc = DateTime.UtcNow;
    }

    await _db.SaveChangesAsync(ct);

    return new MessageResponseDto(
        $"{employee.FullName}'s account access has been revoked.");
}

    
    public async Task<ManagerDashboardDto> GetDashboardAsync(Guid managerProfileId, CancellationToken ct = default)
    {

        
        var employees = await _db.UserProfiles
            .Include(u => u.Department)
            .Include(u => u.EmployeeSkills)
                .ThenInclude(es => es.Skill)
            .Include(u => u.AssessmentAttempts)
            .Include(u => u.LearningPlans)
            .Where(u => u.Role == UserRole.Employee && u.ApprovalStatus == ApprovalStatus.Active)
            .ToListAsync(ct);

        var totalEmployees = employees.Count;
        var completedAttemptsCount = employees.Sum(e => e.AssessmentAttempts.Count(a => a.Status == AssessmentAttemptStatus.Completed));
        var requiringTrainingCount = employees.Count(e => e.EmployeeSkills.Any(s => s.GapScore > 0));

        var skillAverages = employees
            .SelectMany(e => e.EmployeeSkills)
            .GroupBy(es => es.Skill.Name)
            .Select(g => new SkillAverageDto(
                g.Key,
                (int)Math.Round(g.Average(es => (double)Math.Min(es.CurrentLevel, es.TargetLevel) / Math.Max(1, es.TargetLevel) * 100.0))))
            .OrderBy(s => s.CurrentPercent)
            .Take(6)
            .ToList();

        var empPerf = employees
            .Select(e =>
            {
                var latest = e.AssessmentAttempts
                    .Where(a => a.Status == AssessmentAttemptStatus.Completed)
                    .OrderByDescending(a => a.CompletedAtUtc)
                    .FirstOrDefault();
                var score = latest?.ScorePercent ?? SkillGapEngine.ComputeOverallReadinessPercent(e.EmployeeSkills);
                return new EmployeePerformanceBarDto(e.FullName, score);
            })
            .Take(6)
            .ToList();

        var attentionRows = employees
            .Where(e => e.EmployeeSkills.Any(s => s.GapScore > 0) || !e.AssessmentAttempts.Any(a => a.Status == AssessmentAttemptStatus.Completed))
            .OrderByDescending(e => e.EmployeeSkills.Sum(s => s.GapScore))
            .Take(5)
            .Select(e =>
            {
                var topGap = e.EmployeeSkills.OrderByDescending(s => s.GapScore).FirstOrDefault();
                var latestPlan = e.LearningPlans.OrderByDescending(p => p.CreatedAtUtc).FirstOrDefault();
                return new EmployeeAttentionRowDto(
                    e.Id,
                    e.AvatarInitials,
                    e.FullName,
                    e.Department?.Name ?? "General",
                    topGap != null ? topGap.Skill.Name : "Baseline Assessment Pending",
                    latestPlan?.ProgressPercent ?? 0);
            })
            .ToList();

        int notStarted = 0, inProgress = 0, completed = 0;
        foreach (var emp in employees)
        {
            var latestPlan = emp.LearningPlans.OrderByDescending(p => p.CreatedAtUtc).FirstOrDefault();
            if (latestPlan == null || latestPlan.ProgressPercent == 0) notStarted++;
            else if (latestPlan.ProgressPercent >= 100) completed++;
            else inProgress++;
        }

        var activities = await _db.ActivityLogs
            .OrderByDescending(a => a.CreatedAtUtc)
            .Take(5)
            .Select(a => new ManagerRecentActivityDto(
                a.Id,
                a.Category,
                a.Title,
                $"{a.ActorName} · {a.Summary}",
                a.CreatedAtUtc.ToString("MMM d, HH:mm")))
            .ToListAsync(ct);

        return new ManagerDashboardDto(
            totalEmployees,
            totalEmployees,
            completedAttemptsCount,
            requiringTrainingCount,
            80,
            skillAverages,
            empPerf,
            attentionRows,
            new TrainingProgressBreakdownDto(totalEmployees, notStarted, inProgress, completed),
            activities);
    }

    
public async Task<CandidatesOverviewDto> GetCandidatesAsync(
    Guid managerProfileId,
    string? search,
    Guid? jobRoleId,
    string? stage,
    CancellationToken ct = default)
{
    var query = _db.UserProfiles
        .AsNoTracking()
        .Include(u => u.Department)
        .Include(u => u.TargetRole)
        .Where(u =>
    u.Role == UserRole.Employee &&
    u.ApprovalStatus == ApprovalStatus.Active);

    if (!string.IsNullOrWhiteSpace(search))
    {
        var term = search.Trim();

        query = query.Where(u =>
            u.FullName.Contains(term) ||
            u.Email.Contains(term));
    }

    if (jobRoleId.HasValue)
    {
        query = query.Where(u => u.TargetRoleId == jobRoleId.Value);
    }

    var employees = await query
        .OrderBy(u => u.FullName)
        .ToListAsync(ct);

    var dtos = employees.Select(u => new CandidateDto(
        u.Id,
        u.FullName,
        u.Email,
        u.TargetRoleId ?? Guid.Empty,
        u.TargetRole != null ? u.TargetRole.Title : "Not assigned",
        u.DepartmentId ?? Guid.Empty,
        u.Department != null ? u.Department.Name : "Not assigned",
        "Active",
        null,
        null,
        null
    )).ToList();

    return new CandidatesOverviewDto(
        dtos.Count,
        dtos.Select(u => u.DepartmentId).Distinct().Count(),
        0,
        0,
        0,
        dtos,
        $"{dtos.Count} active registered employee(s) found."
    );
}


    public async Task<CandidateDto> CreateCandidateAsync(Guid managerProfileId, CreateCandidateDto request, CancellationToken ct = default)
    {
        var role = await _db.JobRoles.FirstOrDefaultAsync(r => r.Id == request.JobRoleId, ct)
            ?? throw new NotFoundException(nameof(JobRole), request.JobRoleId);
        var dept = await _db.Departments.FirstOrDefaultAsync(d => d.Id == request.DepartmentId, ct)
            ?? throw new NotFoundException(nameof(Department), request.DepartmentId);

        if (!Enum.TryParse<CandidateStage>(request.Stage, true, out var stage))
        {
            stage = CandidateStage.Screening;
        }

        DateTime? followUp = DateTime.TryParse(request.NextFollowUpDate, out var parsedDate) ? parsedDate : null;

        var candidate = new Candidate
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            JobRoleId = role.Id,
            JobRole = role,
            DepartmentId = dept.Id,
            Department = dept,
            Stage = stage,
            NextFollowUpDateUtc = followUp,
            Notes = request.Notes?.Trim(),
            ManagedByUserProfileId = managerProfileId
        };

        _db.Candidates.Add(candidate);
        await _db.SaveChangesAsync(ct);
        return MapCandidateDto(candidate);
    }

    public async Task<CandidateDto> UpdateCandidateStageAsync(Guid managerProfileId, Guid candidateId, UpdateCandidateDto request, CancellationToken ct = default)
    {
        var candidate = await _db.Candidates
            .Include(c => c.JobRole)
            .Include(c => c.Department)
            .FirstOrDefaultAsync(c => c.Id == candidateId, ct)
            ?? throw new NotFoundException(nameof(Candidate), candidateId);

        if (Enum.TryParse<CandidateStage>(request.Stage, true, out var stage))
        {
            candidate.Stage = stage;
        }
        if (request.SkillScorePercent.HasValue)
        {
            candidate.SkillScorePercent = Math.Clamp(request.SkillScorePercent.Value, 0, 100);
        }
        if (!string.IsNullOrWhiteSpace(request.NextFollowUpDate) && DateTime.TryParse(request.NextFollowUpDate, out var parsed))
        {
            candidate.NextFollowUpDateUtc = parsed;
        }
        if (request.Notes != null)
        {
            candidate.Notes = request.Notes.Trim();
        }
        candidate.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return MapCandidateDto(candidate);
    }

    public async Task<LearningPlanManagementDto> GetLearningPlanManagementAsync(Guid managerProfileId, string? status, Guid? departmentId, CancellationToken ct = default)
    {
        var employeesQuery = _db.UserProfiles
            .Include(u => u.Department)
            .Include(u => u.EmployeeSkills).ThenInclude(es => es.Skill)
            .Include(u => u.LearningPlans)
                .ThenInclude(ep => ep.LearningPlan)
            .Include(u => u.LearningPlans)
                .ThenInclude(ep => ep.ModuleProgresses)
                    .ThenInclude(mp => mp.LearningModule)
                        .ThenInclude(m => m.Skill)
            .Where(u => u.Role == UserRole.Employee && u.ApprovalStatus == ApprovalStatus.Active);

        if (departmentId.HasValue)
        {
            employeesQuery = employeesQuery.Where(u => u.DepartmentId == departmentId.Value);
        }

        var employees = await employeesQuery.OrderBy(u => u.FullName).ToListAsync(ct);
        var templates = await _db.LearningPlans
            .Include(lp => lp.TargetRole)
            .OrderBy(lp => lp.Title)
            .Select(lp => new PlanTemplateOptionDto(lp.Id, lp.Title, lp.TargetRole.Title))
            .ToListAsync(ct);

        var empOptions = employees
            .Select(e => new EmployeeSelectOptionDto(e.Id, e.FullName, e.Department?.Name ?? "General"))
            .ToList();

        var rows = employees.Select(MapEmployeePlanRow).ToList();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            rows = rows.Where(r => r.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return new LearningPlanManagementDto(empOptions, templates, rows);
    }

    public async Task<MessageResponseDto> AssignLearningPlanAsync(Guid managerProfileId, AssignLearningPlanDto request, CancellationToken ct = default)
    {
        var employee = await _db.UserProfiles.FirstOrDefaultAsync(u => u.Id == request.EmployeeId, ct)
            ?? throw new NotFoundException(nameof(UserProfile), request.EmployeeId);

        var template = await _db.LearningPlans
            .Include(lp => lp.Modules)
            .FirstOrDefaultAsync(lp => lp.Id == request.LearningPlanId, ct)
            ?? throw new NotFoundException(nameof(LearningPlan), request.LearningPlanId);

        var empPlan = new EmployeeLearningPlan
        {
            UserProfileId = employee.Id,
            LearningPlanId = template.Id,
            ProgressPercent = 0,
            DueDateUtc = request.DueDate,
            AssignedByManagerProfileId = managerProfileId
        };
        _db.EmployeeLearningPlans.Add(empPlan);

        foreach (var module in template.Modules.OrderBy(m => m.OrderIndex))
        {
            _db.EmployeeModuleProgresses.Add(new EmployeeModuleProgress
            {
                EmployeeLearningPlanId = empPlan.Id,
                LearningModuleId = module.Id,
                Status = module.OrderIndex == 1 ? ModuleProgressStatus.InProgress : ModuleProgressStatus.NotStarted
            });
        }

        _db.Notifications.Add(new Notification
        {
            UserProfileId = employee.Id,
            Category = NotificationCategory.Learning,
            Title = $"New Learning Plan Assigned: {template.Title}",
            Message = $"Your manager assigned '{template.Title}' with a target due date of {request.DueDate:MMM d, yyyy}.",
            ActionLabel = "Open Learning Plan",
            ActionRoute = "/employee/learning-plan"
        });

        _db.ActivityLogs.Add(new ActivityLog
        {
            UserProfileId = employee.Id,
            ActorName = employee.FullName,
            Category = "Learning",
            Title = $"Assigned '{template.Title}'",
            Summary = $"Manager assigned learning plan '{template.Title}' to {employee.FullName}."
        });

        await _db.SaveChangesAsync(ct);
        return new MessageResponseDto($"Assigned '{template.Title}' to {employee.FullName}.");
    }

    public async Task<PlanTemplateOptionDto> CreateLearningPlanTemplateAsync(Guid managerProfileId, CreateLearningPlanTemplateDto request, CancellationToken ct = default)
    {
        var role = await _db.JobRoles
            .Include(r => r.SkillRequirements)
            .FirstOrDefaultAsync(r => r.Id == request.TargetRoleId, ct)
            ?? throw new NotFoundException(nameof(JobRole), request.TargetRoleId);

        var plan = new LearningPlan
        {
            Title = request.Title.Trim(),
            TargetRoleId = role.Id,
            EstimatedWeeks = Math.Max(1, request.EstimatedWeeks),
            IsAiGenerated = false,
            GoalLabel = $"{role.Title} Readiness",
            CreatedByUserProfileId = managerProfileId
        };
        _db.LearningPlans.Add(plan);

        if (request.Modules.Count > 0)
        {
            int idx = 1;
            foreach (var mod in request.Modules)
            {
                _db.LearningModules.Add(new LearningModule
                {
                    LearningPlanId = plan.Id,
                    SkillId = mod.SkillId,
                    OrderIndex = idx++,
                    Title = mod.Title.Trim(),
                    Description = mod.Description.Trim(),
                    EstimatedHours = mod.EstimatedHours
                });
            }
        }
        else
        {
            int idx = 1;
            foreach (var req in role.SkillRequirements.Take(3))
            {
                var skill = await _db.Skills.FirstAsync(s => s.Id == req.SkillId, ct);
                _db.LearningModules.Add(new LearningModule
                {
                    LearningPlanId = plan.Id,
                    SkillId = skill.Id,
                    OrderIndex = idx++,
                    Title = $"{skill.Name} Mastery Workshop",
                    Description = $"Targeted applied practice for {skill.Name} toward {role.Title} proficiency.",
                    EstimatedHours = 3.0m
                });
            }
        }

        await _db.SaveChangesAsync(ct);
        return new PlanTemplateOptionDto(plan.Id, plan.Title, role.Title);
    }

    public async Task<MessageResponseDto> SendTrainingReminderAsync(Guid managerProfileId, SendReminderRequestDto request, CancellationToken ct = default)
    {
        var employee = await _db.UserProfiles.FirstOrDefaultAsync(u => u.Id == request.EmployeeId, ct)
            ?? throw new NotFoundException(nameof(UserProfile), request.EmployeeId);

        var msg = string.IsNullOrWhiteSpace(request.Message)
            ? "Friendly reminder from your manager: please continue your assigned SkillBridge learning modules before your upcoming target date."
            : request.Message.Trim();

        _jobs.EnqueueTrainingReminderNotification(employee.Id, msg);
        return new MessageResponseDto($"Training reminder queued via Hangfire for {employee.FullName}.");
    }

    public async Task<TrainingMonitoringDto> GetTrainingMonitoringAsync(Guid managerProfileId, string? search, Guid? departmentId, string? status, CancellationToken ct = default)
    {
        var query = _db.UserProfiles
            .Include(u => u.Department)
            .Include(u => u.EmployeeSkills).ThenInclude(es => es.Skill)
            .Include(u => u.LearningPlans)
                .ThenInclude(ep => ep.LearningPlan)
            .Include(u => u.LearningPlans)
                .ThenInclude(ep => ep.ModuleProgresses)
                    .ThenInclude(mp => mp.LearningModule)
                        .ThenInclude(m => m.Skill)
            .Where(u => u.Role == UserRole.Employee && u.ApprovalStatus == ApprovalStatus.Active);

        if (departmentId.HasValue)
        {
            query = query.Where(u => u.DepartmentId == departmentId.Value);
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u => u.FullName.Contains(search));
        }

        var employees = await query.OrderBy(u => u.FullName).ToListAsync(ct);
        var rows = employees.Select(MapEmployeePlanRow).ToList();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            rows = rows.Where(r => r.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        var assignedCount = rows.Count(r => r.EmployeeLearningPlanId.HasValue);
        var completedCount = rows.Count(r => r.Status == "Completed");
        var needsAttentionCount = rows.Count(r => r.Status is "NotStarted" or "AssessFirst");
        var departmentsCount = await _db.Departments.CountAsync(ct);

        var followUp = needsAttentionCount > 0
            ? $"{needsAttentionCount} employee(s) need baseline assessment or module follow-up."
            : "All assigned employees are actively progressing through their plans.";

        return new TrainingMonitoringDto(
            assignedCount,
            completedCount,
            needsAttentionCount,
            departmentsCount,
            rows,
            followUp,
            DateTime.UtcNow.AddDays(7).ToString("MMM d, yyyy"));
    }

    public async Task<SkillGapAnalyticsDto> GetSkillGapAnalyticsAsync(Guid managerProfileId, Guid? departmentId, Guid? jobRoleId, Guid? assessmentId, CancellationToken ct = default)
    {
        var employeesQuery = _db.UserProfiles
            .Include(u => u.Department)
            .Include(u => u.EmployeeSkills).ThenInclude(es => es.Skill)
            .Include(u => u.AssessmentAttempts)
            .Where(u => u.Role == UserRole.Employee && u.ApprovalStatus == ApprovalStatus.Active);

        if (departmentId.HasValue)
        {
            employeesQuery = employeesQuery.Where(u => u.DepartmentId == departmentId.Value);
        }
        if (jobRoleId.HasValue)
        {
            employeesQuery = employeesQuery.Where(u => u.TargetRoleId == jobRoleId.Value);
        }

        var employees = await employeesQuery.ToListAsync(ct);
        if (assessmentId.HasValue)
        {
            employees = employees
                .Where(e => e.AssessmentAttempts.Any(a => a.AssessmentId == assessmentId.Value))
                .ToList();
        }

        var totalEmployees = employees.Count;
        var assessedEmployees = employees.Where(e => e.EmployeeSkills.Any()).ToList();
        var employeesWithGaps = assessedEmployees.Count(e => e.EmployeeSkills.Any(s => s.GapScore > 0));
        var meetingReq = assessedEmployees.Count(e => e.EmployeeSkills.All(s => s.GapScore == 0));

        var allSkills = await _db.Skills.OrderBy(s => s.Name).ToListAsync(ct);
        var skillNames = allSkills.Select(s => s.Name).ToList();

        var vectors = assessedEmployees.Select(e =>
        {
            var dict = skillNames.ToDictionary(
                name => name,
                name => (double)(e.EmployeeSkills.FirstOrDefault(es => es.Skill.Name == name)?.GapScore ?? 0));
            return new AiEmployeeSkillVectorDto(e.Id.ToString(), e.FullName, dict);
        }).ToList();

        var clusterAnalysis = await _aiClient.AnalyzeSkillClustersAsync(
            new AiClusterAnalysisRequestDto(skillNames, vectors), ct);

        var prioritySkills = assessedEmployees
            .SelectMany(e => e.EmployeeSkills.Where(s => s.GapScore > 0))
            .GroupBy(s => s.Skill.Name)
            .Select(g => new PrioritySkillGapDto(g.Key, g.Select(x => x.UserProfileId).Distinct().Count()))
            .OrderByDescending(p => p.EmployeesBelowCount)
            .Take(5)
            .ToList();

        var recommendedActions = prioritySkills.Take(3).Select(p => new RecommendedActionItemDto(
            $"Targeted Cohort Coaching: {p.SkillName}",
            $"{p.EmployeesBelowCount} employee(s) currently score below target level in {p.SkillName}. Assign applied labs and review progress in 7 days.")).ToList();

        if (recommendedActions.Count == 0)
        {
            recommendedActions.Add(new RecommendedActionItemDto(
                "Establish Team Baseline Coverage",
                "Ensure active employees complete role baseline assessments so Scikit-learn clustering and explainable gap analysis can compute team priorities."));
        }

        var gapRows = new List<EmployeeSkillGapRowDto>();
        foreach (var emp in employees)
        {
            if (!emp.EmployeeSkills.Any())
            {
                gapRows.Add(new EmployeeSkillGapRowDto(
                    emp.Id,
                    emp.FullName,
                    "Baseline Pending",
                    null,
                    null,
                    "Assess first",
                    "Prompt employee to complete initial assessment"));
                continue;
            }

            foreach (var es in emp.EmployeeSkills.OrderByDescending(x => x.GapScore))
            {
                gapRows.Add(new EmployeeSkillGapRowDto(
                    emp.Id,
                    emp.FullName,
                    es.Skill.Name,
                    es.CurrentLevel,
                    es.TargetLevel,
                    es.GapScore > 0 ? $"-{es.GapScore} level" : "On target",
                    es.GapScore > 0 ? $"Assign {es.Skill.Name} practice module" : "Maintain proficiency"));
            }
        }

        return new SkillGapAnalyticsDto(
            assessedEmployees.Count,
            totalEmployees,
            employeesWithGaps,
            meetingReq,
            clusterAnalysis.Methodology,
            clusterAnalysis.Clusters.Select(c => new ClusterInsightDto(c.ClusterLabel, c.EmployeeCount, c.FocusSkills)).ToList(),
            prioritySkills,
            recommendedActions,
            gapRows);
    }

    public async Task<byte[]> ExportSkillGapAnalysisAsync(Guid managerProfileId, Guid? departmentId, Guid? jobRoleId, CancellationToken ct = default)
    {
        var analytics = await GetSkillGapAnalyticsAsync(managerProfileId, departmentId, jobRoleId, null, ct);
        return _reportExporter.ExportSkillGapCsv(analytics.EmployeeSkillGaps);
    }

    public async Task<ManagerProfileDto> GetProfileAsync(Guid managerProfileId, CancellationToken ct = default)
    {
        var manager = await _db.UserProfiles
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == managerProfileId, ct)
            ?? throw new NotFoundException(nameof(UserProfile), managerProfileId);

        var employees = await _db.UserProfiles
            .Include(u => u.Department)
            .Include(u => u.EmployeeSkills)
            .Where(u => u.Role == UserRole.Employee && u.ApprovalStatus == ApprovalStatus.Active)
            .ToListAsync(ct);

        var deptNames = employees.Select(e => e.Department?.Name).Where(n => !string.IsNullOrWhiteSpace(n)).Distinct().ToList();
        var assessedCount = employees.Count(e => e.EmployeeSkills.Any());
        var withGapsCount = employees.Count(e => e.EmployeeSkills.Any(s => s.GapScore > 0));

        return new ManagerProfileDto(
            manager.FullName,
            manager.Email,
            manager.PhoneNumber,
            manager.Location,
            manager.JobTitle ?? "Engineering Manager",
            manager.EmployeeCode,
            manager.Department?.Name ?? "Engineering",
            employees.Count,
            deptNames.Count > 0 ? string.Join(", ", deptNames) : manager.Department?.Name ?? "Engineering",
            assessedCount,
            withGapsCount,
            "Bi-weekly skill & training review",
            DateTime.UtcNow.AddDays(14).ToString("MMM d, yyyy"),
            manager.ApprovalStatus.ToString());
    }

    public async Task<ManagerReportsDto> GetReportsAsync(Guid managerProfileId, CancellationToken ct = default)
    {
        var employees = await _db.UserProfiles
            .Include(u => u.EmployeeSkills)
            .Include(u => u.LearningPlans)
            .Where(u => u.Role == UserRole.Employee && u.ApprovalStatus == ApprovalStatus.Active)
            .ToListAsync(ct);

        var reports = await _db.ReportRecords
            .OrderByDescending(r => r.CreatedAtUtc)
            .Take(10)
            .Select(r => new ReportRecordDto(
                r.Id,
                r.Title,
                r.ReportType,
                r.DepartmentName,
                r.CreatedAtUtc.ToString("MMM d, yyyy"),
                r.CreatedByName,
                r.Format))
            .ToListAsync(ct);

        var schedule = await _db.ReportSchedules
            .Where(s => s.ManagerUserProfileId == managerProfileId)
            .OrderByDescending(s => s.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        ReportScheduleDto? scheduleDto = schedule == null
            ? null
            : new ReportScheduleDto(
                schedule.Id,
                schedule.ReportType,
                schedule.FrequencyCron,
                schedule.FrequencyCron.Contains("1 * *") ? "Monthly (1st of month)" : "Weekly",
                schedule.RecipientEmail,
                schedule.IsActive);

        return new ManagerReportsDto(
            employees.Count,
            employees.Count(e => e.EmployeeSkills.Any()),
            employees.Count(e => e.EmployeeSkills.Any(s => s.GapScore > 0)),
            employees.Count(e => e.LearningPlans.Any()),
            employees.Count(e => e.LearningPlans.Any(lp => lp.ProgressPercent >= 100)),
            reports,
            scheduleDto);
    }

    public async Task<ReportRecordDto> GenerateReportAsync(Guid managerProfileId, GenerateReportRequestDto request, CancellationToken ct = default)
    {
        var manager = await _db.UserProfiles.FirstOrDefaultAsync(u => u.Id == managerProfileId, ct)
            ?? throw new NotFoundException(nameof(UserProfile), managerProfileId);

        Department? dept = null;
        if (request.DepartmentId.HasValue)
        {
            dept = await _db.Departments.FirstOrDefaultAsync(d => d.Id == request.DepartmentId.Value, ct);
        }

        var analytics = await GetSkillGapAnalyticsAsync(managerProfileId, request.DepartmentId, null, null, ct);
        var headers = new[] { "Employee", "Skill", "Gap Status", "Recommended Action" };
        var rows = analytics.EmployeeSkillGaps
            .Select(r => (r.EmployeeName, r.SkillName, r.GapLabel, r.RecommendedAction))
            .ToList();

        var deptLabel = dept?.Name ?? "All departments";
        var format = request.Format.ToUpperInvariant() == "PDF" ? "PDF" : "CSV";
        var title = $"{request.ReportType} — {deptLabel} ({request.DateRangeLabel})";

        byte[] content = format == "PDF"
            ? _reportExporter.ExportSummaryPdf(title, deptLabel, manager.FullName, rows, headers)
            : _reportExporter.ExportSummaryCsv(title, rows, headers);

        var ext = format == "PDF" ? "pdf" : "csv";
        var record = new ReportRecord
        {
            Title = title,
            ReportType = request.ReportType,
            DepartmentName = deptLabel,
            Format = format,
            FileName = $"skillbridge-{ext}-{DateTime.UtcNow:yyyyMMddHHmm}.{ext}",
            FileContent = content,
            CreatedByName = manager.FullName,
            CreatedByUserProfileId = manager.Id
        };

        _db.ReportRecords.Add(record);
        await _db.SaveChangesAsync(ct);

        return new ReportRecordDto(
            record.Id,
            record.Title,
            record.ReportType,
            record.DepartmentName,
            record.CreatedAtUtc.ToString("MMM d, yyyy"),
            record.CreatedByName,
            record.Format);
    }

    public async Task<(byte[] Content, string ContentType, string FileName)> DownloadReportAsync(Guid reportId, CancellationToken ct = default)
    {
        var report = await _db.ReportRecords.FirstOrDefaultAsync(r => r.Id == reportId, ct)
            ?? throw new NotFoundException(nameof(ReportRecord), reportId);

        var contentType = report.Format == "PDF" ? "application/pdf" : "text/csv; charset=utf-8";
        return (report.FileContent, contentType, report.FileName);
    }

    public async Task<ReportScheduleDto> SaveReportScheduleAsync(Guid managerProfileId, SaveReportScheduleDto request, CancellationToken ct = default)
    {
        var schedule = await _db.ReportSchedules
            .FirstOrDefaultAsync(s => s.ManagerUserProfileId == managerProfileId, ct);

        if (schedule == null)
        {
            schedule = new ReportSchedule
            {
                ManagerUserProfileId = managerProfileId,
                ReportType = request.ReportType,
                FrequencyCron = request.FrequencyCron,
                RecipientEmail = request.RecipientEmail.Trim(),
                IsActive = request.IsActive
            };
            _db.ReportSchedules.Add(schedule);
        }
        else
        {
            schedule.ReportType = request.ReportType;
            schedule.FrequencyCron = request.FrequencyCron;
            schedule.RecipientEmail = request.RecipientEmail.Trim();
            schedule.IsActive = request.IsActive;
            schedule.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);

        if (schedule.IsActive)
        {
            _jobs.UpsertScheduledReportJob(schedule.Id, schedule.FrequencyCron);
        }
        else
        {
            _jobs.RemoveScheduledReportJob(schedule.Id);
        }

        return new ReportScheduleDto(
            schedule.Id,
            schedule.ReportType,
            schedule.FrequencyCron,
            schedule.FrequencyCron.Contains("1 * *") ? "Monthly" : "Weekly",
            schedule.RecipientEmail,
            schedule.IsActive);
    }

    private static CandidateDto MapCandidateDto(Candidate c)
    {
        return new CandidateDto(
            c.Id,
            c.FullName,
            c.Email,
            c.JobRoleId,
            c.JobRole?.Title ?? "Role",
            c.DepartmentId,
            c.Department?.Name ?? "Department",
            c.Stage.ToString(),
            c.SkillScorePercent,
            c.NextFollowUpDateUtc?.ToString("yyyy-MM-dd"),
            c.Notes);
    }

    private static ManagerEmployeePlanRowDto MapEmployeePlanRow(UserProfile employee)
    {
        var latestPlan = employee.LearningPlans.OrderByDescending(p => p.CreatedAtUtc).FirstOrDefault();
        if (latestPlan == null)
        {
            var hasSkills = employee.EmployeeSkills.Any();
            return new ManagerEmployeePlanRowDto(
                null,
                employee.Id,
                employee.FullName,
                employee.Department?.Name ?? "General",
                hasSkills ? "No Plan Assigned" : "Baseline Assessment Pending",
                0,
                0,
                0,
                "—",
                hasSkills ? "NotStarted" : "AssessFirst",
                new List<PlanCourseRowDto>(),
                hasSkills ? $"{employee.EmployeeSkills.Count(s => s.GapScore > 0)} skill gaps identified" : "Awaiting initial skill assessment",
                hasSkills ? "Assign a learning plan template" : "Remind employee to take baseline assessment");
        }

        var courses = latestPlan.ModuleProgresses
            .OrderBy(mp => mp.LearningModule.OrderIndex)
            .Select(mp => new PlanCourseRowDto(
                mp.LearningModuleId,
                mp.LearningModule.Title,
                mp.LearningModule.Skill.Name,
                mp.Status.ToString()))
            .ToList();

        var completed = courses.Count(c => c.Status == "Completed");
        var status = completed == courses.Count && courses.Count > 0
            ? "Completed"
            : completed > 0 || latestPlan.ProgressPercent > 0 ? "InProgress" : "NotStarted";

        return new ManagerEmployeePlanRowDto(
            latestPlan.Id,
            employee.Id,
            employee.FullName,
            employee.Department?.Name ?? "General",
            latestPlan.LearningPlan.Title,
            completed,
            courses.Count,
            latestPlan.ProgressPercent,
            latestPlan.DueDateUtc?.ToString("MMM d, yyyy") ?? "Flexible",
            status,
            courses,
            $"Goal: {latestPlan.LearningPlan.GoalLabel}",
            status == "Completed" ? "Review mastery assessment" : "Track module completion and send check-in if stalled");
    }
}
