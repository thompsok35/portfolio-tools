using Microsoft.EntityFrameworkCore;
using PortfolioTools.API.Data;
using PortfolioTools.API.DTOs;
using PortfolioTools.API.Models;

namespace PortfolioTools.API.Services;

public interface ISummaryService
{
    Task<MonthlySummaryDto> GetMonthlySummaryAsync(string userId, int year, int month);
    Task<QuarterlySummaryDto> GetQuarterlySummaryAsync(string userId, int year, int quarter);
}

public class SummaryService : ISummaryService
{
    private readonly AppDbContext _db;

    public SummaryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<MonthlySummaryDto> GetMonthlySummaryAsync(string userId, int year, int month)
    {
        var allSources = await _db.IncomeSources
            .Include(x => x.IncomeType)
            .Where(x => x.UserId == userId && x.IsActive)
            .ToListAsync();

        var applicableSources = allSources.Where(s => AppliesToMonth(s, year, month)).ToList();

        var expenses = await _db.ExpenseCategories
            .Where(x => x.UserId == userId && x.IsActive)
            .ToListAsync();

        var totalIncome = applicableSources.Sum(s => s.Amount);
        var totalExpenses = expenses.Sum(e => e.PlannedAmount);

        var incomeByType = applicableSources
            .GroupBy(s => s.IncomeType?.Name ?? "Unknown")
            .ToDictionary(g => g.Key, g => g.Sum(s => s.Amount));

        return new MonthlySummaryDto
        {
            Year = year,
            Month = month,
            TotalIncome = totalIncome,
            TotalExpenses = totalExpenses,
            NetSurplusDeficit = totalIncome - totalExpenses,
            IncomeSources = applicableSources.Select(MapIncomeSource).ToList(),
            ExpenseCategories = expenses.Select(MapExpenseCategory).ToList(),
            IncomeByType = incomeByType
        };
    }

    public async Task<QuarterlySummaryDto> GetQuarterlySummaryAsync(string userId, int year, int quarter)
    {
        if (quarter < 1 || quarter > 4)
            throw new ArgumentOutOfRangeException(nameof(quarter), "Quarter must be between 1 and 4.");

        var startMonth = (quarter - 1) * 3 + 1;
        var months = new[] { startMonth, startMonth + 1, startMonth + 2 };

        var monthlyBreakdown = new List<MonthlySummaryDto>();
        foreach (var month in months)
        {
            var summary = await GetMonthlySummaryAsync(userId, year, month);
            monthlyBreakdown.Add(summary);
        }

        return new QuarterlySummaryDto
        {
            Year = year,
            Quarter = quarter,
            TotalIncome = monthlyBreakdown.Sum(m => m.TotalIncome),
            TotalExpenses = monthlyBreakdown.Sum(m => m.TotalExpenses),
            NetSurplusDeficit = monthlyBreakdown.Sum(m => m.NetSurplusDeficit),
            MonthlyBreakdown = monthlyBreakdown
        };
    }

    /// <summary>
    /// Determines whether an income source applies to the given year/month
    /// based on its frequency and TargetDate.
    /// </summary>
    private static bool AppliesToMonth(IncomeSource source, int year, int month)
    {
        return source.Frequency switch
        {
            IncomeFrequency.Monthly => true,
            IncomeFrequency.BiMonthly => source.TargetDate.Month == month || IsAlternateMonth(source.TargetDate.Month, month),
            IncomeFrequency.Quarterly => IsQuarterlyMonth(source.TargetDate.Month, month),
            IncomeFrequency.Yearly => source.TargetDate.Month == month,
            _ => false
        };
    }

    /// <summary>
    /// For Bi-Monthly: applies every other month starting from TargetDate month.
    /// </summary>
    private static bool IsAlternateMonth(int startMonth, int currentMonth)
    {
        var diff = Math.Abs(currentMonth - startMonth);
        return diff % 2 == 0;
    }

    /// <summary>
    /// For Quarterly: applies in the same month of each quarter cycle.
    /// E.g., if TargetDate month is March (3), it applies in March, June, September, December.
    /// </summary>
    private static bool IsQuarterlyMonth(int targetMonth, int currentMonth)
    {
        // Normalize to 0-based (0-11)
        var target0 = (targetMonth - 1) % 3;
        var current0 = (currentMonth - 1) % 3;
        return target0 == current0;
    }

    private static IncomeSourceDto MapIncomeSource(IncomeSource s) => new()
    {
        Id = s.Id,
        Amount = s.Amount,
        Source = s.Source,
        IncomeTypeId = s.IncomeTypeId,
        IncomeTypeName = s.IncomeType?.Name,
        Frequency = s.Frequency,
        TargetDate = s.TargetDate,
        Description = s.Description,
        IsActive = s.IsActive
    };

    private static ExpenseCategoryDto MapExpenseCategory(ExpenseCategory e) => new()
    {
        Id = e.Id,
        Name = e.Name,
        IsFixed = e.IsFixed,
        PlannedAmount = e.PlannedAmount,
        IsActive = e.IsActive
    };
}
