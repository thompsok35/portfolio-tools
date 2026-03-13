using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class UserProfile
{
    public Guid Id { get; set; }
    
    // Links this profile directly to the owning user
    public Guid UserId { get; set; }
    
    [MaxLength(100)]
    public string? AccountName { get; set; }
    
    [MaxLength(50)]
    public string? FriendlyName { get; set; }
}
