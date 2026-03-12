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
public class IntegrationsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly api.Services.EncryptionService _encryptionService;

    public IntegrationsController(AppDbContext context, api.Services.EncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
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
    public async Task<ActionResult<IEnumerable<PortfolioIntegration>>> GetIntegrations()
    {
        var userId = GetUserId();
        var integrations = await _context.PortfolioIntegrations
            .Where(i => i.UserId == userId)
            .AsNoTracking()
            .ToListAsync();
            
        // Mask the API Token securely before returning the index payload to the UI
        foreach(var i in integrations)
        {
            if (!string.IsNullOrEmpty(i.EncryptedApiAccessToken))
                i.EncryptedApiAccessToken = "***";
        }
            
        return integrations;
    }

    [HttpPost]
    public async Task<ActionResult<PortfolioIntegration>> PostIntegration(PortfolioIntegration integration)
    {
        if (!await HasPlanAccessAsync(integration.PlanId)) return Forbid();

        var userId = GetUserId();
        integration.UserId = userId;

        if (integration.Id == Guid.Empty)
            integration.Id = Guid.NewGuid();

        // Enforce AES-256 Storage over raw API Tokens
        if (!string.IsNullOrEmpty(integration.EncryptedApiAccessToken))
        {
            integration.EncryptedApiAccessToken = _encryptionService.Encrypt(integration.EncryptedApiAccessToken);
        }

        _context.PortfolioIntegrations.Add(integration);
        await _context.SaveChangesAsync();

        // Re-mask before returning to keep the payload clean
        integration.EncryptedApiAccessToken = "***";

        return CreatedAtAction(nameof(GetIntegrations), new { id = integration.Id }, integration);
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIntegration(Guid id)
    {
        var userId = GetUserId();
        var integration = await _context.PortfolioIntegrations.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
        
        if (integration == null)
        {
            return NotFound();
        }

        _context.PortfolioIntegrations.Remove(integration);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
