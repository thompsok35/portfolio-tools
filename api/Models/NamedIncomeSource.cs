using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class NamedIncomeSource
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}
