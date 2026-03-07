using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PortfolioTools.API.DTOs;
using PortfolioTools.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace PortfolioTools.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _config;

    public AuthController(UserManager<ApplicationUser> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new ApplicationUser
        {
            UserName = request.Username,
            Email = request.Email,
            ApiToken = GenerateApiToken(),
            ApiTokenCreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email!,
            Username = user.UserName!,
            Token = GenerateJwtToken(user),
            ApiToken = user.ApiToken!,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized(new { message = "Invalid credentials." });

        return Ok(new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email!,
            Username = user.UserName!,
            Token = GenerateJwtToken(user),
            ApiToken = user.ApiToken ?? string.Empty,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
    }

    [Authorize]
    [HttpPost("regenerate-api-token")]
    public async Task<IActionResult> RegenerateApiToken()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null) return NotFound();

        user.ApiToken = GenerateApiToken();
        user.ApiTokenCreatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return Ok(new { apiToken = user.ApiToken });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null) return NotFound();

        return Ok(new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email!,
            Username = user.UserName!,
            Token = GenerateJwtToken(user),
            ApiToken = user.ApiToken ?? string.Empty,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.UserName!)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Generates a URL-safe, cryptographically random API token (48 bytes = ~64 base64 characters
    /// after padding removal). This token is distinct from the JWT and is used for long-lived
    /// machine-to-machine integration with other portfolio management tools.
    /// </summary>
    private static string GenerateApiToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(48))
            .Replace("+", "-").Replace("/", "_").Replace("=", "");
    }
}
