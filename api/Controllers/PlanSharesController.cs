using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

namespace api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class PlanSharesController : ControllerBase
{
    private readonly AppDbContext _context;

    public PlanSharesController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }

    // List all active shares FOR a specific Plan (that the current user owns)
    [HttpGet("{planId}")]
    public async Task<ActionResult<IEnumerable<PlanShare>>> GetPlanShares(Guid planId)
    {
        var userId = GetUserId();
        
        // Ensure the current user actually owns the plan they are querying shares for
        var plan = await _context.Plans.FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId);
        if (plan == null)
        {
            return Forbid();
        }

        return await _context.PlanShares
            .Where(ps => ps.PlanId == planId)
            .OrderByDescending(ps => ps.CreatedAt)
            .ToListAsync();
    }

    // Create a new Share Invitation
    [HttpPost]
    public async Task<ActionResult<PlanShare>> PostPlanShare(PlanShare planShare)
    {
        var userId = GetUserId();
        
        // Verify ownership
        var plan = await _context.Plans.FirstOrDefaultAsync(p => p.Id == planShare.PlanId && p.UserId == userId);
        if (plan == null)
        {
            return Forbid();
        }

        // Check if an active/pending share already exists to prevent duplicate emails
        var existingShare = await _context.PlanShares
            .FirstOrDefaultAsync(ps => ps.PlanId == planShare.PlanId && ps.SharedWithEmail.ToLower() == planShare.SharedWithEmail.ToLower());
            
        if (existingShare != null)
        {
            return BadRequest(new { message = "This email is already invited to this plan." });
        }

        if (planShare.Id == Guid.Empty)
        {
            planShare.Id = Guid.NewGuid();
        }

        planShare.CreatedAt = DateTime.UtcNow;
        planShare.Status = "Active"; // Auto-active for V1 simplicity

        _context.PlanShares.Add(planShare);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPlanShares), new { planId = planShare.PlanId }, planShare);
    }

    // Revoke a share
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePlanShare(Guid id)
    {
        var userId = GetUserId();
        var planShare = await _context.PlanShares.FindAsync(id);
        
        if (planShare == null)
        {
            return NotFound();
        }

        // Verify the deleter actually owns the underlying plan
        var plan = await _context.Plans.FirstOrDefaultAsync(p => p.Id == planShare.PlanId && p.UserId == userId);
        if (plan == null)
        {
            return Forbid();
        }

        _context.PlanShares.Remove(planShare);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
