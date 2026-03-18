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
    
    // The base URL of the external portfolio API endpoint
    [MaxLength(500)]
    public string PortfolioEndpointUrl { get; set; } = string.Empty;

    // Optional constraint to rigidly limit fetch to a specific account id
    [MaxLength(100)]
    public string? AccountNumber { get; set; }
}
