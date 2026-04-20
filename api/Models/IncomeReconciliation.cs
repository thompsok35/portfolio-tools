using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models;

public class IncomeReconciliation
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid PlanId { get; set; }

    [Required]
    public Guid IncomeSourceId { get; set; }

    [Required]
    public int Year { get; set; }

    [Required]
    public int Month { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal RealizedAmount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
