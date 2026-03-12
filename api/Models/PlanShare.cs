using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class PlanShare
{
    public Guid Id { get; set; }
    
    public Guid PlanId { get; set; }
    
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string SharedWithEmail { get; set; } = string.Empty;
    
    // e.g. "Pending", "Active"
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
