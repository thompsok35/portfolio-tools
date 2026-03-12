using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;
using api.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class IncomeSourcesController : ControllerBase
{
    private readonly AppDbContext _context;

    public IncomeSourcesController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }

    private string GetUserEmail()
    {
        return User.FindFirstValue(ClaimTypes.Email)?.ToLower() ?? string.Empty;
    }

    private async Task<bool> HasPlanAccessAsync(Guid planId)
    {
        var userId = GetUserId();
        var defaultPlanId = new Guid("00000000-0000-0000-0000-000000000000");
        if (planId == defaultPlanId) return true;

        var plan = await _context.Plans.AsNoTracking().FirstOrDefaultAsync(p => p.Id == planId);
        if (plan == null) return false;
        if (plan.UserId == userId) return true;

        var userEmail = GetUserEmail();
        return await _context.PlanShares.AnyAsync(ps => ps.PlanId == planId && ps.SharedWithEmail.ToLower() == userEmail && ps.Status == "Active");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IncomeSource>>> GetIncomeSources([FromQuery] Guid planId)
    {
        if (!await HasPlanAccessAsync(planId)) return Forbid();

        return await _context.IncomeSources
            .Where(i => i.PlanId == planId)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IncomeSource>> GetIncomeSource(Guid id)
    {
        var incomeSource = await _context.IncomeSources.FindAsync(id);

        if (incomeSource == null)
        {
            return NotFound();
        }

        if (!await HasPlanAccessAsync(incomeSource.PlanId)) return Forbid();

        return incomeSource;
    }

    [HttpPost]
    public async Task<ActionResult<IncomeSource>> PostIncomeSource(IncomeSource incomeSource)
    {
        if (!await HasPlanAccessAsync(incomeSource.PlanId)) return Forbid();

        // For new entities, ensure an Id is generated if empty
        if (incomeSource.Id == Guid.Empty)
            incomeSource.Id = Guid.NewGuid();

        _context.IncomeSources.Add(incomeSource);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetIncomeSource), new { id = incomeSource.Id }, incomeSource);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutIncomeSource(Guid id, IncomeSource incomeSource)
    {
        if (id != incomeSource.Id)
        {
            return BadRequest();
        }
        
        var existing = await _context.IncomeSources.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
        if (existing == null) return NotFound();
        
        if (!await HasPlanAccessAsync(existing.PlanId)) return Forbid();
        if (existing.PlanId != incomeSource.PlanId && !await HasPlanAccessAsync(incomeSource.PlanId)) return Forbid();

        _context.Entry(incomeSource).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!IncomeSourceExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIncomeSource(Guid id)
    {
        var incomeSource = await _context.IncomeSources.FindAsync(id);
        if (incomeSource == null)
        {
            return NotFound();
        }

        if (!await HasPlanAccessAsync(incomeSource.PlanId)) return Forbid();

        _context.IncomeSources.Remove(incomeSource);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool IncomeSourceExists(Guid id)
    {
        return _context.IncomeSources.Any(e => e.Id == id);
    }
}
