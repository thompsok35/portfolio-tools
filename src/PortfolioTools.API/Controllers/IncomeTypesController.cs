using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioTools.API.Data;
using PortfolioTools.API.DTOs;
using PortfolioTools.API.Models;
using System.Security.Claims;

namespace PortfolioTools.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IncomeTypesController : ControllerBase
{
    private readonly AppDbContext _db;

    public IncomeTypesController(AppDbContext db) => _db = db;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<List<IncomeTypeDto>>> GetAll()
    {
        var types = await _db.IncomeTypes
            .Where(x => x.UserId == UserId)
            .OrderBy(x => x.Name)
            .ToListAsync();

        return types.Select(Map).ToList();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<IncomeTypeDto>> GetById(Guid id)
    {
        var type = await _db.IncomeTypes.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        return type == null ? NotFound() : Map(type);
    }

    [HttpPost]
    public async Task<ActionResult<IncomeTypeDto>> Create([FromBody] CreateIncomeTypeRequest req)
    {
        var entity = new IncomeType
        {
            Name = req.Name,
            UserId = UserId
        };

        _db.IncomeTypes.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, Map(entity));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.IncomeTypes.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (entity == null) return NotFound();

        var hasIncome = await _db.IncomeSources.AnyAsync(x => x.IncomeTypeId == id && x.UserId == UserId);
        if (hasIncome) return BadRequest(new { message = "Cannot delete an income type that is in use." });

        _db.IncomeTypes.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static IncomeTypeDto Map(IncomeType t) => new() { Id = t.Id, Name = t.Name };
}
