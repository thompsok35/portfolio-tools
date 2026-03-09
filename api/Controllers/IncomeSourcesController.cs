using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IncomeSource>>> GetIncomeSources([FromQuery] Guid planId)
    {
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

        return incomeSource;
    }

    [HttpPost]
    public async Task<ActionResult<IncomeSource>> PostIncomeSource(IncomeSource incomeSource)
    {
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

        _context.IncomeSources.Remove(incomeSource);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool IncomeSourceExists(Guid id)
    {
        return _context.IncomeSources.Any(e => e.Id == id);
    }
}
