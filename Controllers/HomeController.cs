using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Services;

namespace SkillBridge.Controllers;

public class HomeController : Controller
{
    [HttpGet("/")]
    public IActionResult Index() => View();

    [HttpGet("/error")]
    public IActionResult Error() => View();
}

public class DemoController : Controller
{
    private readonly MockDataService _data;

    public DemoController(MockDataService data) => _data = data;

    [HttpGet("/demo/employee")]
    public Task<IActionResult> Employee() => SignInAndGo(_data.Employee, "/employee/dashboard", "Employee");

    [HttpGet("/demo/manager")]
    public Task<IActionResult> Manager() => SignInAndGo(_data.Manager, "/manager/dashboard", "Manager");

    private async Task<IActionResult> SignInAndGo(MockDataService.DemoUser user, string redirect, string role)
    {
        var claims = new List<System.Security.Claims.Claim>
        {
            new(System.Security.Claims.ClaimTypes.Name, user.Name),
            new(System.Security.Claims.ClaimTypes.Email, user.Email),
            new(System.Security.Claims.ClaimTypes.Role, role),
            new("initials", user.Initials),
            new("target_role", user.TargetRole),
            new("department", user.Department),
            new("employee_id", user.EmployeeId),
            new("tone", user.Tone)
        };
        var identity = new System.Security.Claims.ClaimsIdentity(claims, Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(
            Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults.AuthenticationScheme,
            new System.Security.Claims.ClaimsPrincipal(identity));
        return Redirect(redirect);
    }
}
