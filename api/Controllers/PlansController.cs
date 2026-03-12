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
public class PlansController : ControllerBase
{
    private readonly AppDbContext _context;

    public PlansController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }

    private string GetUserEmail()
    {
        return User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Plan>>> GetPlans()
    {
        var userId = GetUserId();
        var userEmail = GetUserEmail().ToLower();
        
        // Always include the default plan in case the user has legacy items
        var defaultPlanId = new Guid("00000000-0000-0000-0000-000000000000");
        
        return await _context.Plans
            .Where(p => p.UserId == userId 
                || p.Id == defaultPlanId
                || _context.PlanShares.Any(ps => ps.PlanId == p.Id && ps.SharedWithEmail.ToLower() == userEmail && ps.Status == "Active"))
            .OrderBy(p => p.CreatedAt)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Plan>> PostPlan(Plan plan)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        if (plan.Id == Guid.Empty)
        {
            plan.Id = Guid.NewGuid();
        }

        plan.UserId = userId;
        plan.CreatedAt = DateTime.UtcNow;

        _context.Plans.Add(plan);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPlans), new { id = plan.Id }, plan);
    }
}
