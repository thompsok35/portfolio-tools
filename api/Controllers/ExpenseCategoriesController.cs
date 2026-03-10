using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

using Microsoft.AspNetCore.Authorization;

namespace api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ExpenseCategoriesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly api.Services.EncryptionService _encryptionService;

    public ExpenseCategoriesController(AppDbContext context, api.Services.EncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseCategory>>> GetExpenseCategories([FromQuery] Guid planId)
    {
        var expenses = await _context.ExpenseCategories
            .Where(e => e.PlanId == planId)
            .AsNoTracking()
            .ToListAsync();
            
        foreach(var e in expenses)
        {
            if (!string.IsNullOrEmpty(e.EncryptedPassword))
                e.EncryptedPassword = "***";
        }
        
        return expenses;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseCategory>> GetExpenseCategory(Guid id)
    {
        var expenseCategory = await _context.ExpenseCategories.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);

        if (expenseCategory == null)
            return NotFound();

        if (!string.IsNullOrEmpty(expenseCategory.EncryptedPassword))
            expenseCategory.EncryptedPassword = "***";

        return expenseCategory;
    }
    
    [HttpGet("{id}/password")]
    public async Task<ActionResult<object>> GetExpensePassword(Guid id)
    {
        var expense = await _context.ExpenseCategories.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        if (expense == null) return NotFound();

        if (string.IsNullOrEmpty(expense.EncryptedPassword))
            return Ok(new { password = "" });

        try 
        {
            var raw = _encryptionService.Decrypt(expense.EncryptedPassword);
            return Ok(new { password = raw });
        }
        catch
        {
            return BadRequest("Failed to decrypt password payload.");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseCategory>> PostExpenseCategory(ExpenseCategory expenseCategory)
    {
        if (expenseCategory.Id == Guid.Empty)
            expenseCategory.Id = Guid.NewGuid();

        if (!string.IsNullOrEmpty(expenseCategory.EncryptedPassword))
        {
            expenseCategory.EncryptedPassword = _encryptionService.Encrypt(expenseCategory.EncryptedPassword);
        }

        _context.ExpenseCategories.Add(expenseCategory);
        await _context.SaveChangesAsync();
        
        // Mask it before returning back to the client natively
        if (!string.IsNullOrEmpty(expenseCategory.EncryptedPassword))
            expenseCategory.EncryptedPassword = "***";

        return CreatedAtAction(nameof(GetExpenseCategory), new { id = expenseCategory.Id }, expenseCategory);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutExpenseCategory(Guid id, ExpenseCategory expenseCategory)
    {
        if (id != expenseCategory.Id)
            return BadRequest();
            
        var existing = await _context.ExpenseCategories.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        if (existing == null)
            return NotFound();

        if (expenseCategory.EncryptedPassword == "***")
        {
            // The frontend didn't touch the password box
            expenseCategory.EncryptedPassword = existing.EncryptedPassword;
        }
        else if (!string.IsNullOrEmpty(expenseCategory.EncryptedPassword))
        {
            // The user typed a brand new raw password
            expenseCategory.EncryptedPassword = _encryptionService.Encrypt(expenseCategory.EncryptedPassword);
        }
        else
        {
            // The user deleted the password explicitly
            expenseCategory.EncryptedPassword = null;
        }

        _context.Entry(expenseCategory).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ExpenseCategoryExists(id))
                return NotFound();
            else
                throw;
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
