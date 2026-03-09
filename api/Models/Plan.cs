using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class Plan
{
    public Guid Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    // Links this plan directly to the owning user
    public Guid UserId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
