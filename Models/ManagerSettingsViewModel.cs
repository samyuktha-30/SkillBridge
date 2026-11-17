using System.ComponentModel.DataAnnotations;

namespace SkillBridge.Models;

public sealed class ManagerSettingsViewModel
{
    public string FullName { get; set; } = "";
    public string EmailAddress { get; set; } = "";
    public string EmployeeId { get; set; } = "";
    public string Department { get; set; } = "";

    public bool AssessmentResults { get; set; } = true;
    public bool LearningPlanUpdates { get; set; } = true;
    public bool TrainingDeadlineAlerts { get; set; } = true;
    public bool MonthlyReportDelivery { get; set; } = true;
    public bool SystemAnnouncements { get; set; }
    public bool TwoFactorAuthentication { get; set; }

    [Required]
    [RegularExpression("^(Light|Dark)$", ErrorMessage = "Choose a valid theme.")]
    public string Theme { get; set; } = "Light";

    [Required]
    [RegularExpression("^(English|Hindi)$", ErrorMessage = "Choose a valid language.")]
    public string Language { get; set; } = "English";

    [Required]
    [RegularExpression("^(IST \\(UTC \\+5:30\\)|UTC)$", ErrorMessage = "Choose a valid time zone.")]
    public string TimeZone { get; set; } = "IST (UTC +5:30)";

    [Required]
    [RegularExpression("^(All departments|Engineering|Operations|Data & Insights)$", ErrorMessage = "Choose a valid team view.")]
    public string DefaultTeamView { get; set; } = "All departments";
}
