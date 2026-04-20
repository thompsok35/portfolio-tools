using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models;

public class CsvImportProfile
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public Guid PlanId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string BrokerName { get; set; } = string.Empty;

    // Mapping configurations
    [MaxLength(100)]
    public string DateColumn { get; set; } = string.Empty;
    [MaxLength(50)]
    public string DateFormat { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string SymbolColumn { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string ActionColumn { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string AmountColumn { get; set; } = string.Empty;

    [MaxLength(100)]
    public string DividendKeyword { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string OptionKeyword { get; set; } = string.Empty;
}
