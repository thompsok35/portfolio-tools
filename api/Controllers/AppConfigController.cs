using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

using Microsoft.AspNetCore.Authorization;

namespace api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class AppConfigController : ControllerBase
{
    private readonly AppDbContext _context;

    public AppConfigController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{group}")]
    public async Task<ActionResult<IEnumerable<AppConfigCategory>>> GetCategoriesByGroup(string group)
    {
        return await _context.AppConfigCategories
            .Where(c => c.Group == group)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<AppConfigCategory>> PostCategory(AppConfigCategory category)
    {
        if (category.Id == Guid.Empty)
            category.Id = Guid.NewGuid();

        _context.AppConfigCategories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategoriesByGroup), new { group = category.Group }, category);
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var category = await _context.AppConfigCategories.FindAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        _context.AppConfigCategories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
