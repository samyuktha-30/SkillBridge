using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.Services;

namespace SkillBridge.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ILookupService, LookupService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IEmployeeWorkspaceService, EmployeeWorkspaceService>();
        services.AddScoped<IManagerWorkspaceService, ManagerWorkspaceService>();

        return services;
    }
}
