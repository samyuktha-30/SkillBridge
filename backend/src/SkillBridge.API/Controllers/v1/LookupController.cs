using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;

namespace SkillBridge.API.Controllers.v1;

[ApiController]
[Route("api/v1/lookup")]
public class LookupController : ControllerBase
{
    private readonly ILookupService _lookupService;

    public LookupController(ILookupService lookupService)
    {
        _lookupService = lookupService;
    }

    [HttpGet("departments")]
    [AllowAnonymous]
    public async Task<ActionResult<List<DepartmentOptionDto>>> GetDepartments(CancellationToken ct)
    {
        return Ok(await _lookupService.GetDepartmentsAsync(ct));
    }

    [HttpGet("job-roles")]
    [AllowAnonymous]
    public async Task<ActionResult<List<JobRoleOptionDto>>> GetJobRoles(CancellationToken ct)
    {
        return Ok(await _lookupService.GetJobRolesAsync(ct));
    }
}
