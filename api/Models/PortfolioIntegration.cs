using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class PortfolioIntegration
{
    public Guid Id { get; set; }
    
    // Links this integration directly to the owning user
    public Guid UserId { get; set; }
    
    // The specific plan this integration is scoped to
    public Guid PlanId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Nickname { get; set; } = string.Empty;
    
    // AES-256 Encrypted Payload Data
    [Required]
    public string EncryptedApiAccessToken { get; set; } = string.Empty;
}
