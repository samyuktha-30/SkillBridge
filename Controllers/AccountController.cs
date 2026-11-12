using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Services;

namespace SkillBridge.Controllers;

public class AccountController : Controller
{
    private readonly MockDataService _data;

    public AccountController(MockDataService data) => _data = data;

    [HttpGet("/login")]
    public IActionResult Login(string? role) => View(new { Role = NormalizeRole(role) });

    [HttpPost("/login")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(string email, string password, string role, string? returnUrl)
    {
        role = NormalizeRole(role);
        var user = role == "Manager" ? _data.Manager : _data.Employee;
        await SignInAsync(user, email);

        if (!string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl) &&
            returnUrl.StartsWith(role == "Manager" ? "/manager" : "/employee", StringComparison.OrdinalIgnoreCase))
            return Redirect(returnUrl);

        return Redirect(role == "Manager" ? "/manager/dashboard" : "/employee/dashboard");
    }

    [HttpGet("/signup")]
    public IActionResult SignUp(string? role) => View(new { Role = NormalizeRole(role) });

    [HttpPost("/signup")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SignUp(string fullName, string email, string password, string role, string? company)
    {
        role = NormalizeRole(role);
        var baseUser = role == "Manager" ? _data.Manager : _data.Employee;
        var initials = string.Concat(
            (fullName ?? baseUser.Name)
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Take(2)
                .Select(part => char.ToUpperInvariant(part[0])));

        var user = baseUser with
        {
            Name = string.IsNullOrWhiteSpace(fullName) ? baseUser.Name : fullName,
            Email = string.IsNullOrWhiteSpace(email) ? baseUser.Email : email,
            Initials = string.IsNullOrEmpty(initials) ? baseUser.Initials : initials,
            Department = role == "Manager" && !string.IsNullOrWhiteSpace(company) ? company : baseUser.Department
        };

        await SignInAsync(user, user.Email);
        TempData["Toast"] = "Your account is ready. Welcome to SkillBridge AI!";
        return Redirect(role == "Manager" ? "/manager/dashboard" : "/employee/dashboard");
    }

    [HttpGet("/forgot-password")]
    public IActionResult ForgotPassword() => View();

    [HttpPost("/forgot-password")]
    [ValidateAntiForgeryToken]
    public IActionResult ForgotPassword(string email)
    {
        TempData["ResetSent"] = string.IsNullOrWhiteSpace(email) ? "your email" : email;
        return RedirectToAction(nameof(ForgotPassword));
    }

    [HttpPost("/logout")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Redirect("/login");
    }

    [HttpGet("/logout")]
    public async Task<IActionResult> LogoutGet()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Redirect("/login");
    }

    private static string NormalizeRole(string? role)
        => string.Equals(role, "Manager", StringComparison.OrdinalIgnoreCase) ? "Manager" : "Employee";

    private async Task SignInAsync(MockDataService.DemoUser user, string? email)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, string.IsNullOrWhiteSpace(email) ? user.Email : email),
            new(ClaimTypes.Role, user.Role),
            new("initials", user.Initials),
            new("target_role", user.TargetRole),
            new("department", user.Department),
            new("employee_id", user.EmployeeId),
            new("tone", user.Tone)
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity),
            new AuthenticationProperties { IsPersistent = true, ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7) });
    }
}
