using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioTools.API.DTOs;
using PortfolioTools.API.Services;
using System.Security.Claims;

namespace PortfolioTools.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SummaryController : ControllerBase
{
    private readonly ISummaryService _summaryService;

    public SummaryController(ISummaryService summaryService) => _summaryService = summaryService;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>
    /// Returns the net monthly summary for the specified month (MM) and year (YYYY).
    /// </summary>
    [HttpGet("monthly/{year:int}/{month:int}")]
    public async Task<ActionResult<MonthlySummaryDto>> GetMonthly(int year, int month)
    {
        if (month < 1 || month > 12)
            return BadRequest(new { message = "Month must be between 1 and 12." });

        var summary = await _summaryService.GetMonthlySummaryAsync(UserId, year, month);
        return Ok(summary);
    }

    /// <summary>
    /// Returns the quarterly summary for the specified quarter (1-4) and year.
    /// </summary>
    [HttpGet("quarterly/{year:int}/{quarter:int}")]
    public async Task<ActionResult<QuarterlySummaryDto>> GetQuarterly(int year, int quarter)
    {
        if (quarter < 1 || quarter > 4)
            return BadRequest(new { message = "Quarter must be between 1 and 4." });

        var summary = await _summaryService.GetQuarterlySummaryAsync(UserId, year, quarter);
        return Ok(summary);
    }
}
