using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Domain.Entities;
using SkillBridge.Domain.Enums;
using SkillBridge.Infrastructure.Persistence;

namespace SkillBridge.Infrastructure.BackgroundJobs;

public class SkillBridgeHangfireJobs
{
    private readonly ApplicationDbContext _db;
    private readonly IReportExporter _exporter;
    private readonly ILogger<SkillBridgeHangfireJobs> _logger;

    public SkillBridgeHangfireJobs(
        ApplicationDbContext db,
        IReportExporter exporter,
        ILogger<SkillBridgeHangfireJobs> logger)
    {
        _db = db;
        _exporter = exporter;
        _logger = logger;
    }

    public async Task SendTrainingReminderAsync(Guid employeeProfileId, string message)
    {
        var employee = await _db.UserProfiles.FirstOrDefaultAsync(u => u.Id == employeeProfileId);
        if (employee == null) return;

        _db.Notifications.Add(new Notification
        {
            UserProfileId = employee.Id,
            Category = NotificationCategory.Reminder,
            Title = "Manager Training Reminder",
            Message = message,
            ActionLabel = "Open Learning Plan",
            ActionRoute = "/employee/learning-plan"
        });

        var latestPlan = await _db.EmployeeLearningPlans
            .Where(ep => ep.UserProfileId == employee.Id)
            .OrderByDescending(ep => ep.CreatedAtUtc)
            .FirstOrDefaultAsync();
        if (latestPlan != null)
        {
            latestPlan.LastReminderSentAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Dispatched Hangfire training reminder to {Email}.", employee.Email);
    }

    public async Task ExecuteScheduledReportAsync(Guid scheduleId)
    {
        var schedule = await _db.ReportSchedules.FirstOrDefaultAsync(s => s.Id == scheduleId && s.IsActive);
        if (schedule == null) return;

        var employees = await _db.UserProfiles
            .Include(u => u.EmployeeSkills).ThenInclude(es => es.Skill)
            .Where(u => u.Role == UserRole.Employee && u.ApprovalStatus == ApprovalStatus.Active)
            .ToListAsync();

        var headers = new[] { "Employee", "Skill", "Gap Status", "Recommended Action" };
        var rows = employees.SelectMany(e => e.EmployeeSkills.Select(es => (
            e.FullName,
            es.Skill.Name,
            es.GapScore > 0 ? $"-{es.GapScore} level" : "On target",
            es.GapScore > 0 ? $"Assign {es.Skill.Name} training" : "Maintain proficiency"
        ))).ToList();

        var title = $"Scheduled {schedule.ReportType} ({DateTime.UtcNow:MMM yyyy})";
        var content = _exporter.ExportSummaryPdf(title, "All departments", "Hangfire Scheduler", rows, headers);

        _db.ReportRecords.Add(new ReportRecord
        {
            Title = title,
            ReportType = schedule.ReportType,
            DepartmentName = "All departments",
            Format = "PDF",
            FileName = $"skillbridge-scheduled-{DateTime.UtcNow:yyyyMMdd}.pdf",
            FileContent = content,
            CreatedByName = "Automated Scheduler",
            CreatedByUserProfileId = schedule.ManagerUserProfileId
        });

        await _db.SaveChangesAsync();
        _logger.LogInformation("Generated scheduled Hangfire report for schedule {ScheduleId}.", scheduleId);
    }

    public async Task CleanupExpiredRefreshTokensAsync()
    {
        var cutoff = DateTime.UtcNow.AddDays(-7);
        var expired = await _db.RefreshTokens
            .Where(t => t.ExpiresAtUtc < cutoff || (t.RevokedAtUtc != null && t.RevokedAtUtc < cutoff))
            .ToListAsync();

        if (expired.Count > 0)
        {
            _db.RefreshTokens.RemoveRange(expired);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Cleaned up {Count} expired refresh tokens.", expired.Count);
        }
    }
}

public class HangfireJobScheduler : IBackgroundJobScheduler
{
    private readonly IBackgroundJobClient _backgroundJobs;
    private readonly IRecurringJobManager _recurringJobs;

    public HangfireJobScheduler(
        IBackgroundJobClient backgroundJobs,
        IRecurringJobManager recurringJobs)
    {
        _backgroundJobs = backgroundJobs;
        _recurringJobs = recurringJobs;
    }

    public void EnqueueTrainingReminderNotification(Guid employeeProfileId, string message)
    {
        _backgroundJobs.Enqueue<SkillBridgeHangfireJobs>(j => j.SendTrainingReminderAsync(employeeProfileId, message));
    }

    public void UpsertScheduledReportJob(Guid scheduleId, string cronExpression)
    {
        _recurringJobs.AddOrUpdate<SkillBridgeHangfireJobs>(
            $"report-schedule-{scheduleId}",
            j => j.ExecuteScheduledReportAsync(scheduleId),
            cronExpression);
    }

    public void RemoveScheduledReportJob(Guid scheduleId)
    {
        _recurringJobs.RemoveIfExists($"report-schedule-{scheduleId}");
    }
}
