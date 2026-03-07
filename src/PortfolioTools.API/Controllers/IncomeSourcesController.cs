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
public class IncomeSourcesController : ControllerBase
{
    private readonly AppDbContext _db;

    public IncomeSourcesController(AppDbContext db) => _db = db;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<List<IncomeSourceDto>>> GetAll()
    {
        var sources = await _db.IncomeSources
            .Include(x => x.IncomeType)
            .Where(x => x.UserId == UserId)
            .OrderBy(x => x.TargetDate)
            .ToListAsync();

        return sources.Select(Map).ToList();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<IncomeSourceDto>> GetById(Guid id)
    {
        var source = await _db.IncomeSources
            .Include(x => x.IncomeType)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);

        return source == null ? NotFound() : Map(source);
    }

    [HttpPost]
    public async Task<ActionResult<IncomeSourceDto>> Create([FromBody] CreateIncomeSourceRequest req)
    {
        var typeExists = await _db.IncomeTypes.AnyAsync(t => t.Id == req.IncomeTypeId && t.UserId == UserId);
        if (!typeExists) return BadRequest(new { message = "Income type not found." });

        var entity = new IncomeSource
        {
            Amount = req.Amount,
            Source = req.Source,
            IncomeTypeId = req.IncomeTypeId,
            Frequency = req.Frequency,
            TargetDate = req.TargetDate,
            Description = req.Description,
            UserId = UserId
        };

        _db.IncomeSources.Add(entity);
        await _db.SaveChangesAsync();

        await _db.Entry(entity).Reference(x => x.IncomeType).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, Map(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<IncomeSourceDto>> Update(Guid id, [FromBody] UpdateIncomeSourceRequest req)
    {
        var entity = await _db.IncomeSources.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (entity == null) return NotFound();

        var typeExists = await _db.IncomeTypes.AnyAsync(t => t.Id == req.IncomeTypeId && t.UserId == UserId);
        if (!typeExists) return BadRequest(new { message = "Income type not found." });

        entity.Amount = req.Amount;
        entity.Source = req.Source;
        entity.IncomeTypeId = req.IncomeTypeId;
        entity.Frequency = req.Frequency;
        entity.TargetDate = req.TargetDate;
        entity.Description = req.Description;
        entity.IsActive = req.IsActive;

        await _db.SaveChangesAsync();
        await _db.Entry(entity).Reference(x => x.IncomeType).LoadAsync();
        return Map(entity);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.IncomeSources.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (entity == null) return NotFound();

        _db.IncomeSources.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static IncomeSourceDto Map(IncomeSource s) => new()
    {
        Id = s.Id,
        Amount = s.Amount,
        Source = s.Source,
        IncomeTypeId = s.IncomeTypeId,
        IncomeTypeName = s.IncomeType?.Name,
        Frequency = s.Frequency,
        TargetDate = s.TargetDate,
        Description = s.Description,
        IsActive = s.IsActive
    };
}
