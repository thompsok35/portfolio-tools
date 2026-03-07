namespace PortfolioTools.API.Models;

public class IncomeType
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
}
