using Microsoft.EntityFrameworkCore;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;

namespace SkillBridge.Application.Services;

public class LookupService : ILookupService
{
    private readonly IApplicationDbContext _db;

    public LookupService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<DepartmentOptionDto>> GetDepartmentsAsync(CancellationToken ct = default)
    {
        return await _db.Departments
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentOptionDto(d.Id, d.Name, d.Description))
            .ToListAsync(ct);
    }

    public async Task<List<JobRoleOptionDto>> GetJobRolesAsync(CancellationToken ct = default)
    {
        return await _db.JobRoles
            .Include(r => r.Department)
            .OrderBy(r => r.Title)
            .Select(r => new JobRoleOptionDto(r.Id, r.Title, r.DepartmentId, r.Department.Name, r.Description))
            .ToListAsync(ct);
    }
}
