using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class BankAccount
{
    public Guid Id { get; set; }
    
    // Links this account directly to the owning user
    public Guid UserId { get; set; }
    
    [Required]
    [MaxLength(150)]
    public string BankName { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string AccountName { get; set; } = string.Empty;
    
    // Checking, Savings
    [Required]
    [MaxLength(50)]
    public string AccountType { get; set; } = string.Empty;
}
