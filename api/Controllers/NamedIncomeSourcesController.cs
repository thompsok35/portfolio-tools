using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;
using System.Security.Claims;

namespace api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class NamedIncomeSourcesController : ControllerBase
{
    private readonly AppDbContext _context;

    public NamedIncomeSourcesController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NamedIncomeSource>>> GetNamedIncomeSources()
    {
        var userId = GetUserId();
        return await _context.NamedIncomeSources
            .Where(n => n.UserId == userId)
            .AsNoTracking()
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<NamedIncomeSource>> PostNamedIncomeSource(NamedIncomeSource namedSource)
    {
        var userId = GetUserId();
        namedSource.UserId = userId;

        if (namedSource.Id == Guid.Empty)
            namedSource.Id = Guid.NewGuid();

        _context.NamedIncomeSources.Add(namedSource);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetNamedIncomeSources), new { id = namedSource.Id }, namedSource);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNamedIncomeSource(Guid id)
    {
        var userId = GetUserId();
        var namedSource = await _context.NamedIncomeSources.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (namedSource == null)
        {
            return NotFound();
        }

        _context.NamedIncomeSources.Remove(namedSource);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
