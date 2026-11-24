using Hangfire;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Infrastructure.BackgroundJobs;
using SkillBridge.Infrastructure.Identity;
using SkillBridge.Infrastructure.Integrations;
using SkillBridge.Infrastructure.Persistence;
using SkillBridge.Infrastructure.Reporting;

namespace SkillBridge.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
            {
                sql.EnableRetryOnFailure(maxRetryCount: 5);
            }));

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        services.AddIdentityCore<IdentityUser<Guid>>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 8;
                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IIdentityAuthService, IdentityAuthService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IReportExporter, ReportExporter>();
        services.AddScoped<SkillBridgeHangfireJobs>();
        services.AddScoped<IBackgroundJobScheduler, HangfireJobScheduler>();

        var aiBaseUrl = configuration["AiService:BaseUrl"] ?? "http://localhost:8000";
        var aiInternalKey = configuration["AiService:InternalKey"] ?? "dev-internal-key-change-me";
        services.AddHttpClient<IAiServiceClient, AiServiceClient>(client =>
        {
            client.BaseAddress = new Uri(aiBaseUrl);
            client.Timeout = TimeSpan.FromSeconds(45);
            client.DefaultRequestHeaders.Add("X-Internal-Service-Key", aiInternalKey);
        });

        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UseSqlServerStorage(connectionString));

        services.AddHangfireServer();

        return services;
    }
}
