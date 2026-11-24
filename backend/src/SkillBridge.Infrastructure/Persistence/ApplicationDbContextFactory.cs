using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SkillBridge.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        var conn = Environment.GetEnvironmentVariable("SKILLBRIDGE_SQL_CONNECTION")
            ?? "Server=localhost;Database=SkillBridgeDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true";

        optionsBuilder.UseSqlServer(conn);
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
