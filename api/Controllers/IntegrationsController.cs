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
    private readonly IHttpClientFactory _httpClientFactory;

    public IntegrationsController(AppDbContext context, api.Services.EncryptionService encryptionService, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _encryptionService = encryptionService;
        _httpClientFactory = httpClientFactory;
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
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIntegration(Guid id, [FromBody] UpdateIntegrationDto dto)
    {
        var userId = GetUserId();
        var integration = await _context.PortfolioIntegrations.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (integration == null)
            return NotFound(new { success = false, message = "Integration not found." });

        if (!await HasPlanAccessAsync(dto.PlanId)) return Forbid();

        integration.Nickname = dto.Nickname;
        integration.PlanId = dto.PlanId;
        integration.PortfolioEndpointUrl = dto.PortfolioEndpointUrl;
        integration.AccountNumber = dto.AccountNumber;

        // Only overwrite API token if a new one is provided.
        if (!string.IsNullOrWhiteSpace(dto.EncryptedApiAccessToken))
        {
            integration.EncryptedApiAccessToken = _encryptionService.Encrypt(dto.EncryptedApiAccessToken);
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Integration updated successfully." });
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

    [HttpPost("{id}/test")]
    public async Task<ActionResult> TestConnection(Guid id)
    {
        var userId = GetUserId();
        var integration = await _context.PortfolioIntegrations
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (integration == null)
            return NotFound(new { success = false, message = "Integration not found." });

        // Verify we can decrypt the stored token
        string decryptedToken;
        try
        {
            decryptedToken = _encryptionService.Decrypt(integration.EncryptedApiAccessToken);
            if (string.IsNullOrWhiteSpace(decryptedToken))
                return BadRequest(new { success = false, message = "Stored API token is empty." });
        }
        catch (Exception)
        {
            return BadRequest(new { success = false, message = "Failed to decrypt stored API token." });
        }

        // Attempt to reach the portfolio endpoint URL
        if (string.IsNullOrWhiteSpace(integration.PortfolioEndpointUrl))
        {
            // No URL stored — just confirm token decryption works
            return Ok(new { success = true, message = "Token verified (no endpoint URL configured)." });
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(10);
            client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", decryptedToken);

            var response = await client.GetAsync(integration.PortfolioEndpointUrl);

            if (response.IsSuccessStatusCode)
                return Ok(new { success = true, message = $"Connection verified — endpoint returned {(int)response.StatusCode}." });
            else
                return Ok(new { success = false, message = $"Endpoint returned HTTP {(int)response.StatusCode} {response.ReasonPhrase}." });
        }
        catch (TaskCanceledException)
        {
            return Ok(new { success = false, message = "Connection timed out after 10 seconds." });
        }
        catch (HttpRequestException ex)
        {
            return Ok(new { success = false, message = $"Connection failed: {ex.Message}" });
        }
    }

    [HttpPost("sync-income/{planId}")]
    public async Task<ActionResult> SyncIncome(Guid planId)
    {
        var userId = GetUserId();
        
        // Find the integration for the active plan
        var integration = await _context.PortfolioIntegrations
            .FirstOrDefaultAsync(i => i.PlanId == planId && i.UserId == userId);

        if (integration == null)
            return NotFound(new { success = false, message = "No valid integration found for this plan." });

        if (string.IsNullOrWhiteSpace(integration.PortfolioEndpointUrl))
            return BadRequest(new { success = false, message = "Integration missing endpoint URL." });

        string decryptedToken;
        try
        {
            decryptedToken = _encryptionService.Decrypt(integration.EncryptedApiAccessToken);
        }
        catch
        {
            return BadRequest(new { success = false, message = "Failed to decrypt API token." });
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(15);
            client.DefaultRequestHeaders.Add("X-API-Key", decryptedToken);

            var requestUrl = integration.PortfolioEndpointUrl.TrimEnd('/') + "/api/strategies";
            if (!string.IsNullOrWhiteSpace(integration.AccountNumber))
            {
                requestUrl += $"?accountId={System.Net.WebUtility.UrlEncode(integration.AccountNumber.Trim())}";
            }

            var response = await client.GetAsync(requestUrl);

            if (!response.IsSuccessStatusCode)
            {
                var statusCodeToReturn = response.StatusCode == System.Net.HttpStatusCode.Unauthorized ? 400 : (int)response.StatusCode;
                return StatusCode(statusCodeToReturn, new { success = false, message = "Failed to fetch strategies from linked account." });
            }

            var content = await response.Content.ReadAsStringAsync();
            var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var strategies = System.Text.Json.JsonSerializer.Deserialize<List<StrategyResponse>>(content, options);

            if (strategies == null || !strategies.Any())
                return Ok(new { success = true, expectedIncome = 0m, message = "No strategies found." });

            var openStrategies = strategies.Where(s => string.Equals(s.Status, "Open", StringComparison.OrdinalIgnoreCase));
            var groupedStrategies = openStrategies.GroupBy(s => new { s.Name, s.ExpirationDate.Year, s.ExpirationDate.Month });
            decimal totalExpectedIncome = 0m;

            foreach (var group in groupedStrategies)
            {
                var groupSum = group.Sum(s => s.ExpectedIncome);
                if (groupSum <= 0) continue;
                
                totalExpectedIncome += groupSum;

                var targetMonth = group.Key.Month;
                var targetYear = group.Key.Year;
                var sourceName = string.IsNullOrWhiteSpace(group.Key.Name) ? "Linked Portfolio Income" : group.Key.Name;

                // Use the 15th of the month as the target date to ensure it falls neatly within calendar UI logic
                var targetDate = new DateTime(targetYear, targetMonth, 15, 0, 0, 0, DateTimeKind.Utc);

                var currentMonthSource = await _context.IncomeSources
                    .FirstOrDefaultAsync(i => i.PlanId == integration.PlanId 
                        && i.Source == sourceName 
                        && i.TargetDate.Month == targetMonth 
                        && i.TargetDate.Year == targetYear);

                if (currentMonthSource != null)
                {
                    currentMonthSource.Amount = groupSum;
                }
                else
                {
                    _context.IncomeSources.Add(new IncomeSource
                    {
                        Id = Guid.NewGuid(),
                        PlanId = integration.PlanId,
                        Source = sourceName,
                        Amount = groupSum,
                        Type = "Option Premium",
                        Frequency = IncomeFrequency.Yearly,
                        TargetDate = targetDate,
                        Description = $"Automatically synced expected income from linked portfolio account for {targetDate:MMMM yyyy}."
                    });
                }
            }
            
            if (totalExpectedIncome > 0)
            {
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true, expectedIncome = totalExpectedIncome, message = "Successfully synced expected income." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error syncing income: " + ex.Message });
        }
    }

    [HttpPost("sync-dividends/{planId}")]
    public async Task<ActionResult> SyncDividends(Guid planId)
    {
        var userId = GetUserId();
        
        var integration = await _context.PortfolioIntegrations
            .FirstOrDefaultAsync(i => i.PlanId == planId && i.UserId == userId);

        if (integration == null)
            return NotFound(new { success = false, message = "No valid integration found for this plan." });

        if (string.IsNullOrWhiteSpace(integration.PortfolioEndpointUrl))
            return BadRequest(new { success = false, message = "Integration missing endpoint URL." });

        string decryptedToken;
        try
        {
            decryptedToken = _encryptionService.Decrypt(integration.EncryptedApiAccessToken);
        }
        catch
        {
            return BadRequest(new { success = false, message = "Failed to decrypt API token." });
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(25); // Dividends can require FMP sub-lookups
            client.DefaultRequestHeaders.Add("X-API-Key", decryptedToken);

            string targetAccountId = integration.AccountNumber?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(targetAccountId)) 
            {
                var parts = decryptedToken.Split('.');
                if (parts.Length >= 2 && parts[0] == "tp") {
                    targetAccountId = parts[1];
                }
                else {
                    return BadRequest(new { success = false, message = "Account Number must be explicitly set to sync dividends." });
                }
            }

            var requestUrl = integration.PortfolioEndpointUrl.TrimEnd('/') + $"/api/tradier/dividends/{System.Net.WebUtility.UrlEncode(targetAccountId)}";
            var response = await client.GetAsync(requestUrl);

            // For diagnostics on the CashMap side
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                // We MUST not return 401 here, or the CashMap UI will intercept it as a local session expiration!
                var statusCodeToReturn = response.StatusCode == System.Net.HttpStatusCode.Unauthorized ? 400 : (int)response.StatusCode;
                return StatusCode(statusCodeToReturn, new { success = false, message = $"Failed to fetch dividends. Code: {response.StatusCode}. Details: {errorBody}" });
            }

            var content = await response.Content.ReadAsStringAsync();
            var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var divData = System.Text.Json.JsonSerializer.Deserialize<DividendSummaryResponse>(content, options);

            if (divData == null || divData.EstimatedAnnualIncome <= 0)
                return Ok(new { success = true, expectedIncome = 0m, message = "No projected dividends found or yield is zero." });

            var monthlyAmount = divData.EstimatedAnnualIncome / 12m;
            var sourceName = "Projected Monthly Dividends";
            var targetMonth = DateTime.UtcNow.Month;
            var targetYear = DateTime.UtcNow.Year;
            var targetDate = new DateTime(targetYear, targetMonth, 15, 0, 0, 0, DateTimeKind.Utc);

            var existingSource = await _context.IncomeSources
                .FirstOrDefaultAsync(i => i.PlanId == integration.PlanId 
                    && i.Source == sourceName 
                    && i.Type == "Dividend Yield");
            
            if (existingSource != null)
            {
                existingSource.Amount = monthlyAmount;
            }
            else
            {
                _context.IncomeSources.Add(new IncomeSource
                {
                    Id = Guid.NewGuid(),
                    PlanId = integration.PlanId,
                    Source = sourceName,
                    Amount = monthlyAmount,
                    Type = "Dividend Yield",
                    Frequency = IncomeFrequency.Monthly, // Repeats natively every month!
                    TargetDate = targetDate,
                    Description = "Automatically synced projected monthly dividends from linked portfolio account."
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, expectedIncome = monthlyAmount, message = "Successfully synced projected monthly dividends." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error syncing dividends: " + ex.Message });
        }
    }
}

public class StrategyResponse
{
    public decimal ExpectedIncome { get; set; }
    public DateTime ExpirationDate { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class DividendSummaryResponse 
{
    public decimal EstimatedAnnualIncome { get; set; }
}

public class UpdateIntegrationDto
{
    public string Nickname { get; set; } = string.Empty;
    public Guid PlanId { get; set; }
    public string? PortfolioEndpointUrl { get; set; }
    public string? AccountNumber { get; set; }
    // Intentionally allowing empty to signify 'preserve old token'
    public string? EncryptedApiAccessToken { get; set; }
}
