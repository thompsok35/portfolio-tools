namespace PortfolioTools.API.Models;

public class IncomeSource
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public decimal Amount { get; set; }
    public string Source { get; set; } = string.Empty;
    public Guid IncomeTypeId { get; set; }
    public IncomeType? IncomeType { get; set; }
    public IncomeFrequency Frequency { get; set; }
    public DateTime TargetDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
    public bool IsActive { get; set; } = true;
}
