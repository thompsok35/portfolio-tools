using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using api.Models;
using api.Data;
using Microsoft.AspNetCore.Authorization;

namespace api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class CsvImportProfilesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CsvImportProfilesController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }

    private async Task<bool> HasPlanAccessAsync(Guid planId)
    {
        var userId = GetUserId();
        var plan = await _context.Plans.AsNoTracking().FirstOrDefaultAsync(p => p.Id == planId);
        return plan != null && plan.UserId == userId;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CsvImportProfile>>> GetCsvImportProfiles([FromQuery] Guid planId)
    {
        if (!await HasPlanAccessAsync(planId)) return Forbid();

        return await _context.CsvImportProfiles
            .Where(p => p.PlanId == planId)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<CsvImportProfile>> CreateCsvImportProfile(CsvImportProfile profile)
    {
        if (!await HasPlanAccessAsync(profile.PlanId)) return Forbid();

        profile.Id = Guid.NewGuid();
        _context.CsvImportProfiles.Add(profile);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCsvImportProfiles), new { id = profile.Id }, profile);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCsvImportProfile(Guid id, CsvImportProfile profile)
    {
        if (id != profile.Id) return BadRequest();
        if (!await HasPlanAccessAsync(profile.PlanId)) return Forbid();

        _context.Entry(profile).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.CsvImportProfiles.AnyAsync(e => e.Id == id))
                return NotFound();
            else
                throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCsvImportProfile(Guid id)
    {
        var profile = await _context.CsvImportProfiles.FindAsync(id);
        if (profile == null) return NotFound();

        if (!await HasPlanAccessAsync(profile.PlanId)) return Forbid();

        _context.CsvImportProfiles.Remove(profile);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
