using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

namespace api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ExpenseCategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ExpenseCategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseCategory>>> GetExpenseCategories()
    {
        return await _context.ExpenseCategories.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseCategory>> GetExpenseCategory(Guid id)
    {
        var expenseCategory = await _context.ExpenseCategories.FindAsync(id);

        if (expenseCategory == null)
        {
            return NotFound();
        }

        return expenseCategory;
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseCategory>> PostExpenseCategory(ExpenseCategory expenseCategory)
    {
        if (expenseCategory.Id == Guid.Empty)
            expenseCategory.Id = Guid.NewGuid();

        _context.ExpenseCategories.Add(expenseCategory);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetExpenseCategory), new { id = expenseCategory.Id }, expenseCategory);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutExpenseCategory(Guid id, ExpenseCategory expenseCategory)
    {
        if (id != expenseCategory.Id)
        {
            return BadRequest();
        }

        _context.Entry(expenseCategory).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ExpenseCategoryExists(id))
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
    public async Task<IActionResult> DeleteExpenseCategory(Guid id)
    {
        var expenseCategory = await _context.ExpenseCategories.FindAsync(id);
        if (expenseCategory == null)
        {
            return NotFound();
        }

        _context.ExpenseCategories.Remove(expenseCategory);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ExpenseCategoryExists(Guid id)
    {
        return _context.ExpenseCategories.Any(e => e.Id == id);
    }
}
