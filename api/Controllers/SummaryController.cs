using Microsoft.AspNetCore.Mvc;
using api.Services;

namespace api.Controllers;

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
    public async Task<ActionResult<SummaryDashboardStats>> GetMonthlySummary(int year, int month)
    {
        if (month < 1 || month > 12)
        {
            return BadRequest("Invalid month parameter.");
        }
        
        var summary = await _summaryService.GetMonthlySummaryAsync(year, month);
        return Ok(summary);
    }
}
