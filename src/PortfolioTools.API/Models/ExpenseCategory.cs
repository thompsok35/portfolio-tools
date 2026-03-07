namespace PortfolioTools.API.Models;

public class ExpenseCategory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public bool IsFixed { get; set; }
    public decimal PlannedAmount { get; set; }
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
    public bool IsActive { get; set; } = true;
}
