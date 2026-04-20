using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using api.Services;
using api.Data;

using Microsoft.AspNetCore.Authorization;

namespace api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class SummaryController : ControllerBase
{
    private readonly SummaryService _summaryService;
    private readonly AppDbContext _context;

    public SummaryController(SummaryService summaryService, AppDbContext context)
    {
        _summaryService = summaryService;
        _context = context;
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
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

    [HttpGet("{year}/{month}")]
    public async Task<ActionResult<SummaryDashboardStats>> GetMonthlySummary(int year, int month, [FromQuery] Guid planId)
    {
        if (!await HasPlanAccessAsync(planId)) return Forbid();

        if (month < 1 || month > 12)
        {
            return BadRequest("Invalid month parameter.");
        }
        
        var summary = await _summaryService.GetMonthlySummaryAsync(year, month, planId);
        return Ok(summary);
    }

    public class ReconcileRequest
    {
        public Guid PlanId { get; set; }
        public Guid IncomeSourceId { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal RealizedIncome { get; set; }
    }

    [HttpPost("reconcile")]
    public async Task<IActionResult> ReconcileMonth([FromBody] ReconcileRequest request)
    {
        if (!await HasPlanAccessAsync(request.PlanId)) return Forbid();

        var record = await _context.IncomeReconciliations
            .FirstOrDefaultAsync(r => r.PlanId == request.PlanId && r.IncomeSourceId == request.IncomeSourceId && r.Year == request.Year && r.Month == request.Month);

        if (record == null)
        {
            record = new api.Models.IncomeReconciliation
            {
                Id = Guid.NewGuid(),
                PlanId = request.PlanId,
                IncomeSourceId = request.IncomeSourceId,
                Year = request.Year,
                Month = request.Month
            };
            _context.IncomeReconciliations.Add(record);
        }

        record.RealizedAmount = request.RealizedIncome;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Income source reconciled successfully." });
    }
}
