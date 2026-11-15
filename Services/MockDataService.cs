using SkillBridge.Models;

namespace SkillBridge.Services;

/// <summary>
/// In-memory demo data for the SkillBridge AI prototype.
/// Swap this out for a real API / database later without touching the views.
/// </summary>
public class MockDataService
{
    public record DemoUser(string Name, string Email, string Role, string Initials, string TargetRole, string Department, string EmployeeId, string Tone);

    public DemoUser Employee => new(
        "Arjun Sharma", "arjun.sharma@rit.edu", "Employee", "AS",
        "Software Developer", "Engineering", "SB2027-1024", "sky");

    public DemoUser Manager => new(
        "Priya Shah", "priya.shah@skillbridge.ai", "Manager", "PS",
        "Engineering Manager", "Engineering", "MGR-1024", "lilac");

    public IReadOnlyList<Skill> Skills { get; } = new List<Skill>
    {
        new("C#", "C#", 4, 5, true),
        new("ASP.NET Core", "NET", 3, 5, false),
        new("SQL Server", "SQL", 4, 5, true),
        new("React", "R", 3, 5, false),
        new("Python", "Py", 4, 5, true),
        new("Java", "Java", 3, 5, false),
    };

    public IReadOnlyList<AssessmentItem> Assessments { get; } = new List<AssessmentItem>
    {
        new("Java Developer Skills Test", "Core Java, OOP, Collections and more", "Due Date", "Nov 10, 2025", "Upcoming", "View Details"),
        new("SQL Fundamentals Assessment", "Queries, Joins and Database Concepts", "Completed On", "Oct 28, 2025", "Completed", "View Results", Score: "88%"),
        new("React Basics Assessment", "Components, Hooks and State Management", "Completed On", "Oct 25, 2025", "Completed", "View Results", Score: "92%"),
        new(".NET Core Assessment", "ASP.NET Core, APIs and .NET Concepts", "Due Date", "Oct 30, 2025", "Pending", "Start Assessment"),
        new("Python Programming Assessment", "Data Types, Functions and more", "Completed On", "Oct 20, 2025", "Completed", "View Results", Score: "85%"),
    };

    public IReadOnlyList<RoadmapModule> Roadmap { get; } = new List<RoadmapModule>
    {
        new("Data Structures & Algorithms Basics", "Arrays, Linked Lists, Stacks and Queues", "1.5 hrs", "Completed"),
        new("Python for Data Science", "NumPy, Pandas and Data Analysis", "2 hrs", "Completed"),
        new("Machine Learning Fundamentals", "Supervised and Unsupervised Learning", "3 hrs", "In Progress", true),
        new("Web Development with .NET", "ASP.NET Core and Web APIs", "2.5 hrs", "Upcoming"),
        new("System Design Basics", "Scalability and Architecture Patterns", "2 hrs", "Upcoming"),
    };

    public IReadOnlyList<LearningResource> FeaturedResources { get; } = new List<LearningResource>
    {
        new("Complete Python Bootcamp", "Learn Python from basics to advanced.", "Course", "12h", "Beginner", "Programming", "Start Learning"),
        new("Data Analysis with Pandas", "Analyze data with Python.", "Video", "1h 20m", "Beginner", "Data Science", "Watch Now"),
        new("Machine Learning Basics", "Understand ML concepts.", "Article", "10 min", "Beginner", "Machine Learning", "Read Article"),
        new("SQL Practice Exercises", "Practice with real-world queries.", "Practice", "30 min", "Intermediate", "Programming", "Start Practice"),
    };

    public IReadOnlyList<LearningResource> RecommendedResources { get; } = new List<LearningResource>
    {
        new("React Fundamentals", "Video • 1h 15m", "Video", "1h 15m", "Beginner", "Web Development", "Recommended"),
        new("System Design Basics", "Article • 15 min", "Article", "15 min", "Beginner", "Web Development", ""),
        new("Java Collections", "Practice • 20 questions", "Practice", "20 questions", "Beginner", "Programming", ""),
        new("DSA for Interviews", "Course • 4h", "Course", "4h", "Intermediate", "Programming", ""),
    };

    public IReadOnlyList<NotificationItem> Notifications { get; } = new List<NotificationItem>
    {
        new("Assessment Reminder", "Your SQL Assessment is scheduled for tomorrow at 10:00 AM.", "2h ago", "assessment", true),
        new("Learning Milestone Achieved!", "Congratulations! You have completed the ASP.NET Core Fundamentals course.", "3h ago", "learning", true),
        new("New Learning Recommendation", "Based on your skill gaps, we recommend React Essentials.", "1d ago", "learning", true),
        new("Training Deadline Approaching", "Complete your Python practice exercises by 30 Sep 2026.", "1d ago", "reminder", false),
        new("Assessment Completed", "Your Data Analytics Assessment has been successfully submitted.", "2d ago", "assessment", false),
        new("Progress Update", "Your skill improvement in SQL is now 75%.", "3d ago", "system", false),
        new("System Update", "New training resources have been added to your dashboard.", "4d ago", "system", false),
    };

    public IReadOnlyList<ActivityItem> EmployeeActivity { get; } = new List<ActivityItem>
    {
        new("Completed: Python for Data Science", "Course", "2 days ago", "book-open"),
        new("Achieved: Skill Growth Champion Badge", "Achievement", "3 days ago", "trophy"),
        new("Viewed: Machine Learning Basics", "Resource", "4 days ago", "file-text"),
    };

    public IReadOnlyList<Achievement> Achievements { get; } = new List<Achievement>
    {
        new("First Assessment Completed", "circle-check"),
        new("Skill Growth Champion", "trophy"),
        new("7-Day Learner", "calendar-days"),
        new("Goal Achiever", "target"),
    };

    public IReadOnlyList<Candidate> Candidates { get; } = new List<Candidate>
    {
        new("Jordan Lee", "Software Developer", "Engineering", "Assessment", "Pending", "5 Nov 2026", "JL", "blue"),
        new("Nina Garcia", "Software Developer", "Engineering", "Interview", "89%", "6 Nov 2026", "NG", "green"),
        new("Owen Brooks", "Support Analyst", "Operations", "Screening", "—", "5 Nov 2026", "OB", "lilac"),
        new("Ava Wilson", "Software Developer", "Engineering", "Interview", "78%", "7 Nov 2026", "AW", "amber"),
        new("Ethan Davis", "Support Analyst", "Operations", "Assessment", "Pending", "6 Nov 2026", "ED", "blue"),
        new("Sofia Ahmed", "Software Developer", "Engineering", "Offer", "100%", "9 Nov 2026", "SA", "green"),
    };

    public IReadOnlyList<EmployeePlan> Plans { get; } = new List<EmployeePlan>
    {
        new("Alex Morgan", "Java & SQL development", "1 of 3", "53%", "30 Nov 2026", "In progress", "AM", "green", "alex-java-sql", "Software Developer", "Engineering"),
        new("Sam Patel", "Developer essentials", "0 of 3", "0%", "30 Nov 2026", "Not started", "SP", "blue", "sam-developer-essentials", "Software Developer", "Engineering"),
        new("Maya Chen", "Support skills refresher", "2 of 2", "100%", "15 Nov 2026", "Completed", "MC", "lilac", "maya-support-refresher", "Support Analyst", "Operations"),
        new("Chris Taylor", "Not assigned", "—", "—", "—", "Assess first", "CT", "amber", Role: "Support Analyst", Department: "Operations"),
    };

    public IReadOnlyList<ManagerLearningPlanDetail> LearningPlanDetails { get; } = new List<ManagerLearningPlanDetail>
    {
        new(
            "alex-java-sql",
            "Alex Morgan",
            "Software Developer",
            "Engineering",
            "Java & SQL development",
            "3 Nov 2026",
            "30 Nov 2026",
            "In progress",
            new List<ManagerLearningPlanSkill>
            {
                new("Java", 2, 3),
                new("SQL", 2, 3),
            },
            new List<ManagerLearningTraining>
            {
                new("Java Foundations", "Java", "4 hours", "High", "Completed", "3 Nov 2026", "10 Nov 2026", 100, "4 Nov 2026", "8 Nov 2026"),
                new("SQL Query Practice", "SQL", "3 hours", "High", "In Progress", "3 Nov 2026", "20 Nov 2026", 60, "9 Nov 2026"),
                new("Applied Java", "Java", "5 hours", "Medium", "Not started", "3 Nov 2026", "30 Nov 2026"),
            }),
        new(
            "sam-developer-essentials",
            "Sam Patel",
            "Software Developer",
            "Engineering",
            "Developer essentials",
            "3 Nov 2026",
            "30 Nov 2026",
            "Not started",
            new List<ManagerLearningPlanSkill>
            {
                new("C#", 2, 4),
                new("ASP.NET Core", 2, 4),
                new("SQL", 3, 4),
            },
            new List<ManagerLearningTraining>
            {
                new("C# Fundamentals", "C#", "4 hours", "High", "Not started", "3 Nov 2026", "12 Nov 2026"),
                new("Building Web APIs with ASP.NET Core", "ASP.NET Core", "6 hours", "High", "Not started", "3 Nov 2026", "20 Nov 2026"),
                new("SQL for Developers", "SQL", "3 hours", "Medium", "Not started", "3 Nov 2026", "30 Nov 2026"),
            }),
        new(
            "maya-support-refresher",
            "Maya Chen",
            "Support Analyst",
            "Operations",
            "Support skills refresher",
            "1 Nov 2026",
            "15 Nov 2026",
            "Completed",
            new List<ManagerLearningPlanSkill>
            {
                new("Customer support", 4, 4),
                new("Troubleshooting", 4, 4),
            },
            new List<ManagerLearningTraining>
            {
                new("Customer Conversations", "Customer support", "2 hours", "Medium", "Completed", "1 Nov 2026", "7 Nov 2026", 100, "2 Nov 2026", "5 Nov 2026"),
                new("Technical Troubleshooting", "Troubleshooting", "3 hours", "Medium", "Completed", "1 Nov 2026", "15 Nov 2026", 100, "6 Nov 2026", "12 Nov 2026"),
            }),
    };

    public IReadOnlyDictionary<string, IReadOnlyList<ManagerTrainingAssessment>> TrainingAssessments { get; } =
        new Dictionary<string, IReadOnlyList<ManagerTrainingAssessment>>(StringComparer.OrdinalIgnoreCase)
        {
            ["Alex Morgan"] = new List<ManagerTrainingAssessment>
            {
                new("SQL Fundamentals Assessment", "88%", "12 Nov 2026", "Completed", "Passed"),
                new("Java Skills Check", null, null, "Upcoming", "Due 18 Nov 2026"),
            },
            ["Maya Chen"] = new List<ManagerTrainingAssessment>
            {
                new("Customer Support Assessment", "92%", "13 Nov 2026", "Completed", "Passed"),
            },
        };

    public ManagerTrainingProgressDetail? GetTrainingProgressDetail(string employeeName)
    {
        var employee = Plans.FirstOrDefault(plan =>
            string.Equals(plan.Employee, employeeName, StringComparison.OrdinalIgnoreCase));
        if (employee is null)
            return null;

        var learningPlan = employee.Id is null
            ? null
            : LearningPlanDetails.FirstOrDefault(plan =>
                string.Equals(plan.Id, employee.Id, StringComparison.OrdinalIgnoreCase));
        var assessments = TrainingAssessments.TryGetValue(employee.Employee, out var employeeAssessments)
            ? employeeAssessments
            : Array.Empty<ManagerTrainingAssessment>();

        return new ManagerTrainingProgressDetail(
            employee.Employee,
            learningPlan?.Role ?? employee.Role,
            learningPlan?.Department ?? employee.Department,
            learningPlan,
            assessments);
    }

    public IReadOnlyList<ManagerEmployee> Attention { get; } = new List<ManagerEmployee>
    {
        new("Maya Nair", "MN", "blue", "Engineering", "Java", "20%", 20),
        new("Rohan Shah", "RS", "green", "Data & Insights", "SQL", "45%", 45),
        new("Neha Rao", "NR", "lilac", "Engineering", "React", "0%", 0),
    };

    public IReadOnlyList<ReportRow> Reports { get; } = new List<ReportRow>
    {
        new("November skill gap summary", "All departments", "3 Nov 2026", "Priya Shah", "PDF", "View details", "november-skill-gap-summary", "Skill Gap Analysis", "1–30 Nov 2026", "Ready"),
        new("October training progress", "Engineering", "31 Oct 2026", "Priya Shah", "CSV", "View details", "october-training-progress", "Training Progress", "1–31 Oct 2026", "Ready"),
        new("October assessment summary", "All departments", "31 Oct 2026", "Priya Shah", "PDF", "View details", "october-assessment-summary", "Assessment Summary", "1–31 Oct 2026", "Ready"),
    };

    public ManagerReportDetail? GetReportDetail(string reportId)
    {
        var report = Reports.FirstOrDefault(item =>
            string.Equals(item.Id, reportId, StringComparison.OrdinalIgnoreCase));
        if (report is null)
            return null;

        var employees = Plans
            .Where(plan => string.Equals(report.Department, "All departments", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(plan.Department, report.Department, StringComparison.OrdinalIgnoreCase))
            .ToList();
        var employeeNames = employees
            .Select(employee => employee.Employee)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var skills = LearningPlanDetails
            .Where(plan => employeeNames.Contains(plan.Employee))
            .SelectMany(plan => plan.Skills.Select(skill =>
                new ManagerReportSkillRow(
                    plan.Employee,
                    plan.Department,
                    skill.Name,
                    skill.CurrentLevel,
                    skill.RequiredLevel)))
            .ToList();

        foreach (var skill in SkillGapRows.Where(skill => employeeNames.Contains(skill.Employee)))
        {
            if (!skills.Any(existing =>
                    string.Equals(existing.Employee, skill.Employee, StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(existing.Skill, skill.Skill, StringComparison.OrdinalIgnoreCase)))
            {
                skills.Add(new ManagerReportSkillRow(
                    skill.Employee,
                    skill.Department,
                    skill.Skill,
                    skill.CurrentLevel,
                    skill.RequiredLevel));
            }
        }

        var planDetails = employees
            .Select(employee => employee.Id is null
                ? null
                : LearningPlanDetails.FirstOrDefault(plan =>
                    string.Equals(plan.Id, employee.Id, StringComparison.OrdinalIgnoreCase)))
            .Where(plan => plan is not null)
            .ToList();
        var trainingPrograms = planDetails
            .SelectMany(plan => plan!.Trainings.Select(training =>
                new ManagerReportTrainingRow(
                    plan.Employee,
                    training.Name,
                    training.SkillCategory,
                    training.ProgressPercent,
                    training.Status,
                    training.TargetCompletionDate)))
            .ToList();

        var employeeRows = employees.Select(employee =>
        {
            var employeeSkills = skills
                .Where(skill => string.Equals(skill.Employee, employee.Employee, StringComparison.OrdinalIgnoreCase))
                .ToList();
            var assessmentResults = TrainingAssessments.TryGetValue(employee.Employee, out var assessments)
                ? string.Join("; ", assessments.Select(assessment =>
                    assessment.Score is not null
                        ? $"{assessment.Name}: {assessment.Score}"
                        : $"{assessment.Name}: {assessment.Result}"))
                : "No assessment records";
            var plan = planDetails.FirstOrDefault(detail =>
                string.Equals(detail?.Employee, employee.Employee, StringComparison.OrdinalIgnoreCase));

            return new ManagerReportEmployeeRow(
                employee.Employee,
                employee.Department,
                employeeSkills.Count(skill => skill.CurrentLevel.HasValue),
                assessmentResults,
                plan?.ProgressPercent ?? 0,
                plan?.Status ?? "Not assigned");
        }).ToList();

        var commonGap = skills
            .Where(skill => skill.Gap is > 0)
            .GroupBy(skill => skill.Skill, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(group => group.Count())
            .ThenBy(group => group.Key, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault();

        var completed = trainingPrograms.Count(training =>
            string.Equals(training.Status, "Completed", StringComparison.OrdinalIgnoreCase));
        var inProgress = trainingPrograms.Count(training =>
            string.Equals(training.Status, "In Progress", StringComparison.OrdinalIgnoreCase));
        var pending = trainingPrograms.Count - completed - inProgress;
        var employeesNeedingTraining = employeeRows
            .Where(employee =>
                skills.Any(skill =>
                    string.Equals(skill.Employee, employee.Name, StringComparison.OrdinalIgnoreCase) &&
                    skill.Gap is > 0) ||
                employee.TrainingStatus is "Not assigned" or "Not started")
            .ToList();

        var insights = new List<ManagerReportInsight>
        {
            new(
                "Most common skill gaps",
                commonGap is null
                    ? "No skill gaps are recorded in the available employee records."
                    : $"{commonGap.Key} is below the required level for {commonGap.Count()} employee(s)."),
            new(
                "Training completion snapshot",
                trainingPrograms.Count == 0
                    ? "No assigned training programs are recorded for this report scope."
                    : $"Current snapshot: {completed} completed, {inProgress} in progress, and {pending} pending across {trainingPrograms.Count} programs. Historical trend data is unavailable."),
            new(
                "Employees requiring additional training",
                employeesNeedingTraining.Count == 0
                    ? "No employees with identified skill gaps or unstarted plans are present in this sample."
                    : string.Join(", ", employeesNeedingTraining.Select(employee => employee.Name)) + "."),
            new(
                "Recommended manager actions",
                commonGap is null
                    ? "Continue reviewing employee assessments and update plans as new results are recorded."
                    : $"Prioritize learning activities for {commonGap.Key}, then review unassigned or unstarted plans.")
        };

        return new ManagerReportDetail(
            report,
            skills,
            trainingPrograms,
            employeeRows,
            insights,
            "Illustrative demo metrics are calculated from the available in-memory mock records. The saved reporting period is metadata; historical snapshots are not stored.");
    }

    public IReadOnlyList<ActivityItem> ManagerActivity { get; } = new List<ActivityItem>
    {
        new("Assessment completed", "Aarav Patel · Python assessment · 88%", "Today, 10:42 AM", "clipboard-check"),
        new("Training completed", "Emily Chen · Advanced SQL", "Today, 9:10 AM", "graduation-cap"),
        new("New skill gap identified", "Neha Rao · React · Assessment score 48%", "Yesterday, 4:15 PM", "trending-up"),
    };

    public IReadOnlyList<(string Icon, string Label, string Value, string Note, string Tone)> ManagerStats { get; } = new List<(string, string, string, string, string)>
    {
        ("users", "Total Employees", "120", "Across all departments", "green"),
        ("user-round", "Active Employees", "105", "Currently active", "green"),
        ("clipboard-check", "Assessments Completed", "85", "Completed assessments", "green"),
        ("graduation-cap", "Employees Requiring Training", "24", "Priority skill development", "blue"),
    };

    public IReadOnlyList<(string Label, int Current, int Target)> SkillGapOverview { get; } = new List<(string, int, int)>
    {
        ("Java", 65, 80), ("Python", 72, 80), ("SQL", 78, 80), ("React", 58, 80), ("Communication", 84, 80),
    };

    public IReadOnlyList<(string Name, int Score)> EmployeePerformance { get; } = new List<(string, int)>
    {
        ("Maya Nair", 52), ("Rohan Shah", 64), ("Neha Rao", 58), ("Aarav Patel", 88), ("Emily Chen", 92),
    };

    public IReadOnlyList<(string Skill, int Count)> PrioritySkills { get; } = new List<(string, int)>
    {
        ("Java", 8), ("SQL", 6), ("Problem solving", 5), ("Communication", 3),
    };

    public IReadOnlyList<ManagerSkillGap> SkillGapRows { get; } = new List<ManagerSkillGap>
    {
        new("Alex Morgan", "Software Developer", "Engineering", "Java", 2, 3, "Java Foundations"),
        new("Alex Morgan", "Software Developer", "Engineering", "SQL", 2, 3, "SQL Query Practice"),
        new("Chris Taylor", "Support Analyst", "Operations", "Not assessed", null, null, "Complete assessment"),
    };

    public IReadOnlyList<string> Departments { get; } = new List<string> { "Engineering", "Operations", "Data & Insights", "All departments" };
    public IReadOnlyList<string> JobRoles { get; } = new List<string> { "Software Developer", "Support Analyst", "Data Analyst", "All roles" };
    public IReadOnlyList<string> Stages { get; } = new List<string> { "Screening", "Assessment", "Interview", "Offer", "All stages" };
    public IReadOnlyList<string> PlanNames { get; } = new List<string> { "Java & SQL development", "Developer essentials", "Support skills refresher", "AI readiness fundamentals" };
    public IReadOnlyList<string> Employees { get; } = new List<string> { "Alex Morgan", "Sam Patel", "Maya Chen", "Chris Taylor", "Jordan Lee" };

    public IReadOnlyList<(string Category, string Label)> ResourceCategories { get; } = new List<(string, string)>
    {
        ("all", "All"), ("programming", "Programming"), ("data-science", "Data Science"),
        ("machine-learning", "Machine Learning"), ("web-development", "Web Development"),
        ("soft-skills", "Soft Skills"), ("other", "Other"),
    };
}
