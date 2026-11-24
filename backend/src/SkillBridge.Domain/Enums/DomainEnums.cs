namespace SkillBridge.Domain.Enums;

public enum UserRole
{
    Employee = 0,
    Manager = 1,
    Admin = 2
}

public enum ApprovalStatus
{
    Active = 0,
    PendingApproval = 1,
    Rejected = 2
}

public enum SkillCategory
{
    Technical = 0,
    Soft = 1
}

public enum AssessmentAttemptStatus
{
    Upcoming = 0,
    Pending = 1,
    InProgress = 2,
    Completed = 3
}

public enum ModuleProgressStatus
{
    Locked = 0,
    NotStarted = 1,
    InProgress = 2,
    Completed = 3
}

public enum ResourceType
{
    Course = 0,
    Video = 1,
    Article = 2,
    Practice = 3
}

public enum CandidateStage
{
    Screening = 0,
    Assessment = 1,
    Interview = 2,
    Offer = 3,
    Hired = 4,
    Archived = 5
}

public enum NotificationCategory
{
    Assessment = 0,
    Learning = 1,
    System = 2,
    Reminder = 3
}
