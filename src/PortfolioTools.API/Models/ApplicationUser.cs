using Microsoft.AspNetCore.Identity;

namespace PortfolioTools.API.Models;

public class ApplicationUser : IdentityUser
{
    public string? ApiToken { get; set; }
    public DateTime ApiTokenCreatedAt { get; set; }
    public ICollection<IncomeSource> IncomeSources { get; set; } = new List<IncomeSource>();
    public ICollection<ExpenseCategory> ExpenseCategories { get; set; } = new List<ExpenseCategory>();
    public ICollection<IncomeType> IncomeTypes { get; set; } = new List<IncomeType>();
}
