using Microsoft.AspNetCore.Mvc;
using api.Services;

using Microsoft.AspNetCore.Authorization;

namespace api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class SummaryController : ControllerBase
{
    private readonly SummaryService _summaryService;

    public SummaryController(SummaryService summaryService)
    {
        _summaryService = summaryService;
    }

    [HttpGet("{year}/{month}")]
    public async Task<ActionResult<SummaryDashboardStats>> GetMonthlySummary(int year, int month, [FromQuery] Guid planId)
    {
        if (month < 1 || month > 12)
        {
            return BadRequest("Invalid month parameter.");
        }
        
        var summary = await _summaryService.GetMonthlySummaryAsync(year, month, planId);
        return Ok(summary);
    }
}
