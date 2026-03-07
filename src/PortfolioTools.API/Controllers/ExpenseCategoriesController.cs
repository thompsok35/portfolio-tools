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
public class ExpenseCategoriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExpenseCategoriesController(AppDbContext db) => _db = db;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<List<ExpenseCategoryDto>>> GetAll()
    {
        var categories = await _db.ExpenseCategories
            .Where(x => x.UserId == UserId)
            .OrderBy(x => x.Name)
            .ToListAsync();

        return categories.Select(Map).ToList();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExpenseCategoryDto>> GetById(Guid id)
    {
        var category = await _db.ExpenseCategories
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);

        return category == null ? NotFound() : Map(category);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseCategoryDto>> Create([FromBody] CreateExpenseCategoryRequest req)
    {
        var entity = new ExpenseCategory
        {
            Name = req.Name,
            IsFixed = req.IsFixed,
            PlannedAmount = req.PlannedAmount,
            UserId = UserId
        };

        _db.ExpenseCategories.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, Map(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ExpenseCategoryDto>> Update(Guid id, [FromBody] UpdateExpenseCategoryRequest req)
    {
        var entity = await _db.ExpenseCategories.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (entity == null) return NotFound();

        entity.Name = req.Name;
        entity.IsFixed = req.IsFixed;
        entity.PlannedAmount = req.PlannedAmount;
        entity.IsActive = req.IsActive;

        await _db.SaveChangesAsync();
        return Map(entity);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.ExpenseCategories.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (entity == null) return NotFound();

        _db.ExpenseCategories.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ExpenseCategoryDto Map(ExpenseCategory e) => new()
    {
        Id = e.Id,
        Name = e.Name,
        IsFixed = e.IsFixed,
        PlannedAmount = e.PlannedAmount,
        IsActive = e.IsActive
    };
}
