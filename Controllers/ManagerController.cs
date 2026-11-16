using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Models;
using SkillBridge.Services;

namespace SkillBridge.Controllers;

[Authorize(Roles = "Manager")]
public class ManagerController : Controller
{
    private readonly MockDataService _data;

    public ManagerController(MockDataService data) => _data = data;

    private void Set(string active, string title, string breadcrumb)
    {
        ViewData["Active"] = active;
        ViewData["PageTitle"] = title;
        ViewData["Breadcrumb"] = breadcrumb;
        ViewData["Role"] = "Manager";
        ViewData["Nav"] = "Manager";
    }

    [HttpGet("/manager/dashboard")]
    public IActionResult Dashboard()
    {
        Set("dashboard", "Manager Dashboard", "Workspace / Overview");
        return View(_data);
    }

    [HttpGet("/manager/candidates")]
    public IActionResult Candidates()
    {
        Set("candidates", "Candidate Management", "Manager workspace");
        return View(_data);
    }

    [HttpGet("/manager/candidates/detail")]
    public IActionResult CandidateDetail(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return NotFound();

        var candidate = _data.Candidates.FirstOrDefault(item =>
            string.Equals(item.Name, name, StringComparison.OrdinalIgnoreCase));
        if (candidate is null)
            return NotFound();

        Set("candidates", "Candidate Detail", "Manager workspace / Candidates");
        return View(candidate);
    }

    [HttpGet("/manager/learning-plans")]
    public IActionResult LearningPlans()
    {
        Set("plans", "Learning Plan Management", "Manager workspace");
        return View(_data);
    }

    [HttpGet("/manager/learning-plans/detail")]
    public IActionResult LearningPlanDetail(string? id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return NotFound();

        var plan = _data.LearningPlanDetails.FirstOrDefault(item =>
            string.Equals(item.Id, id, StringComparison.OrdinalIgnoreCase));
        if (plan is null)
            return NotFound();

        Set("plans", "Learning Plan Detail", "Manager workspace / Learning Plans");
        return View(plan);
    }

    [HttpGet("/manager/training")]
    public IActionResult Training()
    {
        Set("training", "Training & Progress Monitoring", "Manager workspace");
        return View(_data);
    }

    [HttpGet("/manager/training/detail")]
    public IActionResult TrainingDetail(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return NotFound();

        var detail = _data.GetTrainingProgressDetail(name);
        if (detail is null)
            return NotFound();

        Set("training", "Training Progress Detail", "Manager workspace / Training & Progress Monitoring");
        return View(detail);
    }

    [HttpGet("/manager/skill-gaps")]
    public IActionResult SkillGaps()
    {
        Set("gaps", "Skill Gap Analytics", "Manager workspace");
        return View(_data);
    }

    [HttpGet("/manager/skill-gaps/detail")]
    public IActionResult SkillGapDetail(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return NotFound();

        var skills = _data.SkillGapRows
            .Where(item => string.Equals(item.Employee, name, StringComparison.OrdinalIgnoreCase))
            .ToList();
        ManagerSkillGapDetail detail;
        if (skills.Count > 0)
        {
            var employee = skills[0];
            detail = new ManagerSkillGapDetail(
                employee.Employee,
                employee.Role,
                employee.Department,
                skills);
        }
        else
        {
            var plan = _data.LearningPlanDetails.FirstOrDefault(item =>
                string.Equals(item.Employee, name, StringComparison.OrdinalIgnoreCase));
            if (plan is null)
                return NotFound();

            var planSkills = plan.Skills.Select(skill => new ManagerSkillGap(
                plan.Employee,
                plan.Role,
                plan.Department,
                skill.Name,
                skill.CurrentLevel,
                skill.RequiredLevel,
                plan.Trainings.FirstOrDefault(training =>
                    string.Equals(training.SkillCategory, skill.Name, StringComparison.OrdinalIgnoreCase))?.Name
                    ?? "Review learning plan"));
            detail = new ManagerSkillGapDetail(plan.Employee, plan.Role, plan.Department, planSkills.ToList());
        }

        Set("gaps", "Skill Gap Detail", "Manager workspace / Skill Gap Analytics");
        return View(detail);
    }

    [HttpGet("/manager/profile")]
    public IActionResult Profile()
    {
        Set("profile", "My Profile", "Manager workspace");
        return View(CreateProfileViewModel());
    }

    [HttpPost("/manager/profile")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Profile(ManagerProfileViewModel profile)
    {
        Set("profile", "My Profile", "Manager workspace");
        if (!ModelState.IsValid)
        {
            var currentProfile = CreateProfileViewModel();
            profile.EmployeeId = currentProfile.EmployeeId;
            profile.AccountRole = currentProfile.AccountRole;
            profile.AccountStatus = currentProfile.AccountStatus;
            ViewData["ProfileEditing"] = true;
            return View(profile);
        }

        var fullName = profile.FullName?.Trim() ?? "";
        var email = profile.Email?.Trim() ?? "";
        var phoneNumber = profile.PhoneNumber?.Trim() ?? "";
        var department = profile.Department?.Trim() ?? "";
        var jobRole = profile.JobRole?.Trim() ?? "";

        var claims = User.Claims.ToList();
        ReplaceClaim(claims, ClaimTypes.Name, fullName);
        ReplaceClaim(claims, ClaimTypes.Email, email);
        ReplaceClaim(claims, "phone_number", phoneNumber);
        ReplaceClaim(claims, "department", department);
        ReplaceClaim(claims, "target_role", jobRole);
        var initials = string.Concat(fullName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Take(2)
            .Select(part => char.ToUpperInvariant(part[0])));
        ReplaceClaim(claims, "initials", initials);

        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme,
            ClaimTypes.Name,
            ClaimTypes.Role);
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity),
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
            });

        TempData["Toast"] = "Profile updated for this demo account only; changes are not saved to persistent storage.";
        return RedirectToAction(nameof(Profile));
    }

    private ManagerProfileViewModel CreateProfileViewModel() => new()
    {
        FullName = User.FindFirstValue(ClaimTypes.Name) ?? "",
        Email = User.FindFirstValue(ClaimTypes.Email) ?? "",
        PhoneNumber = User.FindFirstValue("phone_number") ?? "",
        Department = User.FindFirstValue("department") ?? "",
        JobRole = User.FindFirstValue("target_role") ?? "",
        EmployeeId = User.FindFirstValue("employee_id") ?? "",
        AccountRole = User.FindFirstValue(ClaimTypes.Role) ?? "Manager",
        AccountStatus = User.Identity?.IsAuthenticated == true ? "Active" : "Inactive"
    };

    private static void ReplaceClaim(ICollection<Claim> claims, string type, string value)
    {
        var existingClaims = claims.Where(claim => claim.Type == type).ToList();
        foreach (var claim in existingClaims)
            claims.Remove(claim);

        claims.Add(new Claim(type, value));
    }

    [HttpGet("/manager/reports")]
    public IActionResult Reports()
    {
        Set("reports", "Reports", "Manager workspace");
        return View(_data);
    }

    [HttpGet("/manager/reports/detail")]
    public IActionResult ReportDetail(string? id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return NotFound();

        var detail = _data.GetReportDetail(id);
        if (detail is null)
            return NotFound();

        Set("reports", "Report Detail", "Manager workspace / Reports");
        return View(detail);
    }

    [HttpGet("/manager/settings")]
    public IActionResult Settings()
    {
        Set("settings", "Settings", "Manager workspace");
        return View(_data);
    }
}
