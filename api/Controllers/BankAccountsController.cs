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
public class BankAccountsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BankAccountsController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BankAccount>>> GetBankAccounts()
    {
        var userId = GetUserId();
        return await _context.BankAccounts
            .Where(b => b.UserId == userId)
            .AsNoTracking()
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<BankAccount>> PostBankAccount(BankAccount bankAccount)
    {
        var userId = GetUserId();
        bankAccount.UserId = userId;
        
        if (bankAccount.Id == Guid.Empty)
            bankAccount.Id = Guid.NewGuid();

        _context.BankAccounts.Add(bankAccount);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBankAccounts), new { id = bankAccount.Id }, bankAccount);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBankAccount(Guid id)
    {
        var userId = GetUserId();
        var bankAccount = await _context.BankAccounts.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        
        if (bankAccount == null)
        {
            return NotFound();
        }

        _context.BankAccounts.Remove(bankAccount);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
