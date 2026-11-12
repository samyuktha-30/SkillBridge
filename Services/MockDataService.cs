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
        new("Alex Morgan", "Java & SQL development", "1 of 3", "33%", "30 Nov 2026", "In progress", "AM", "green"),
        new("Sam Patel", "Developer essentials", "0 of 3", "0%", "30 Nov 2026", "Not started", "SP", "blue"),
        new("Maya Chen", "Support skills refresher", "2 of 2", "100%", "15 Nov 2026", "Completed", "MC", "lilac"),
        new("Chris Taylor", "Not assigned", "—", "—", "—", "Assess first", "CT", "amber"),
    };

    public IReadOnlyList<ManagerEmployee> Attention { get; } = new List<ManagerEmployee>
    {
        new("Maya Nair", "MN", "blue", "Engineering", "Java", "20%", 20),
        new("Rohan Shah", "RS", "green", "Data & Insights", "SQL", "45%", 45),
        new("Neha Rao", "NR", "lilac", "Engineering", "React", "0%", 0),
    };

    public IReadOnlyList<ReportRow> Reports { get; } = new List<ReportRow>
    {
        new("November skill gap summary", "All departments", "3 Nov 2026", "Priya Shah", "PDF", "Download"),
        new("October training progress", "Engineering", "31 Oct 2026", "Priya Shah", "CSV", "Download"),
        new("October assessment summary", "All departments", "31 Oct 2026", "Priya Shah", "PDF", "Download"),
    };

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

    public IReadOnlyList<(string Label, string Value)> SkillGapRows { get; } = new List<(string, string)>
    {
        ("Alex Morgan", "Java|2 / 5|3 / 5|1 level|Java Foundations"),
        ("Alex Morgan", "SQL|2 / 5|3 / 5|1 level|SQL Query Practice"),
        ("Chris Taylor", "Not assessed|—|—|Unknown|Complete assessment"),
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
