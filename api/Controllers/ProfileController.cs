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
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet]
    public async Task<ActionResult<UserProfile>> GetProfile()
    {
        var userId = GetUserId();
        var profile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        
        if (profile == null)
        {
            // Auto-create a stub profile for new users mapping to this tab for the first time
            profile = new UserProfile { UserId = userId };
            _context.UserProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }

        return profile;
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(UserProfile updatedProfile)
    {
        var userId = GetUserId();
        var profile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
            return NotFound();

        profile.AccountName = updatedProfile.AccountName;
        
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
