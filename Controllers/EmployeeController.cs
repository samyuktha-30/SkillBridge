using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Services;

namespace SkillBridge.Controllers;

[Authorize(Roles = "Employee")]
public class EmployeeController : Controller
{
    private readonly MockDataService _data;

    public EmployeeController(MockDataService data) => _data = data;

    private void Set(string active, string title)
    {
        ViewData["Active"] = active;
        ViewData["PageTitle"] = title;
        ViewData["Role"] = "Employee";
        ViewData["Nav"] = "Employee";
    }

    [HttpGet("/employee/dashboard")]
    public IActionResult Dashboard()
    {
        Set("dashboard", "Dashboard");
        ViewData["Heading"] = "Employee Dashboard";
        return View(_data);
    }

    [HttpGet("/employee/skills")]
    public IActionResult Skills()
    {
        Set("skills", "My Skills");
        return View(_data);
    }

    [HttpGet("/employee/assessments")]
    public IActionResult Assessments()
    {
        Set("assessments", "Assessments");
        return View(_data);
    }

    [HttpGet("/employee/learning-plan")]
    public IActionResult LearningPlan()
    {
        Set("learning", "AI Learning Plan");
        return View(_data);
    }

    [HttpGet("/employee/resources")]
    public IActionResult Resources()
    {
        Set("resources", "Resources");
        return View(_data);
    }

    [HttpGet("/employee/progress")]
    public IActionResult Progress()
    {
        Set("progress", "My Progress");
        return View(_data);
    }

    [HttpGet("/employee/assistant")]
    public IActionResult Assistant()
    {
        Set("assistant", "AI Assistant");
        return View(_data);
    }

    [HttpGet("/employee/notifications")]
    public IActionResult Notifications()
    {
        Set("notifications", "Notifications");
        return View(_data);
    }

    [HttpGet("/employee/settings")]
    public IActionResult Settings()
    {
        Set("settings", "Profile Settings");
        return View(_data);
    }
}
