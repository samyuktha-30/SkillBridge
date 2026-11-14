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
        if (skills.Count == 0)
            return NotFound();

        var employee = skills[0];
        var detail = new ManagerSkillGapDetail(
            employee.Employee,
            employee.Role,
            employee.Department,
            skills);

        Set("gaps", "Skill Gap Detail", "Manager workspace / Skill Gap Analytics");
        return View(detail);
    }

    [HttpGet("/manager/profile")]
    public IActionResult Profile()
    {
        Set("profile", "My Profile", "Manager workspace");
        return View(_data);
    }

    [HttpGet("/manager/reports")]
    public IActionResult Reports()
    {
        Set("reports", "Reports", "Manager workspace");
        return View(_data);
    }

    [HttpGet("/manager/settings")]
    public IActionResult Settings()
    {
        Set("settings", "Settings", "Manager workspace");
        return View(_data);
    }
}
