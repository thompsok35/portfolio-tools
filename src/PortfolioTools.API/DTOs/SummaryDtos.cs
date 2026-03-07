namespace PortfolioTools.API.DTOs;

public class MonthlySummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetSurplusDeficit { get; set; }
    public List<IncomeSourceDto> IncomeSources { get; set; } = new();
    public List<ExpenseCategoryDto> ExpenseCategories { get; set; } = new();
    public Dictionary<string, decimal> IncomeByType { get; set; } = new();
}

public class QuarterlySummaryDto
{
    public int Year { get; set; }
    public int Quarter { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetSurplusDeficit { get; set; }
    public List<MonthlySummaryDto> MonthlyBreakdown { get; set; } = new();
}
