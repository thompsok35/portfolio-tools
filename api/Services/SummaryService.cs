using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

namespace api.Services;

public class ExpectedIncomeItem : IncomeSource
{
    public bool IsReconciled { get; set; }
    public decimal RealizedAmount { get; set; }
}

public class SummaryDashboardStats
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetSurplusDeficit => TotalIncome - TotalExpenses;
    public decimal YTDIncome { get; set; }
    public decimal YTDExpenses { get; set; }
    public decimal YTDNetSurplusDeficit => YTDIncome - YTDExpenses;
    public List<ExpectedIncomeItem> ExpectedIncomes { get; set; } = new List<ExpectedIncomeItem>();
}

public class SummaryService
{
    private readonly AppDbContext _context;

    public SummaryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SummaryDashboardStats> GetMonthlySummaryAsync(int year, int month, Guid planId)
    {
        // Fetch all reconciliations for this plan up to the target month for YTD calculations
        var reconciliations = await _context.IncomeReconciliations
            .Where(r => r.PlanId == planId && r.Year == year && r.Month <= month)
            .ToListAsync();

        // 1. Calculate Total Expected Expenses
        var allExpenses = await _context.ExpenseCategories
            .Where(e => e.PlanId == planId)
            .ToListAsync();

        decimal totalExpenses = 0;
        foreach (var expense in allExpenses)
        {
            if (IsExpenseExpectedInMonth(expense, year, month))
            {
                totalExpenses += expense.PlannedAmount;
            }
        }

        // 2. Calculate Expected Income for the target month
        var allIncome = await _context.IncomeSources
            .Where(i => i.PlanId == planId)
            .ToListAsync();
        
        decimal expectedIncome = 0;

        var expectedIncomeItems = new List<ExpectedIncomeItem>();

        foreach (var income in allIncome)
        {
            if (IsIncomeExpectedInMonth(income, year, month))
            {
                expectedIncome += income.Amount;
                var rec = reconciliations.FirstOrDefault(r => r.IncomeSourceId == income.Id && r.Month == month);
                expectedIncomeItems.Add(new ExpectedIncomeItem
                {
                    Id = income.Id,
                    Amount = income.Amount,
                    Source = income.Source,
                    Type = income.Type,
                    Frequency = income.Frequency,
                    TargetDate = income.TargetDate,
                    Description = income.Description,
                    PlanId = income.PlanId,
                    IsReconciled = rec != null,
                    RealizedAmount = rec?.RealizedAmount ?? 0
                });
            }
        }

        // 3. Calculate Year-To-Date Totals (Month 1 through current month)
        decimal ytdIncome = 0;
        decimal ytdExpenses = 0;

        for (int m = 1; m <= month; m++)
        {
            // Expenses
            decimal mExpenses = 0;
            foreach (var expense in allExpenses)
            {
                if (IsExpenseExpectedInMonth(expense, year, m))
                {
                    mExpenses += expense.PlannedAmount;
                }
            }
            ytdExpenses += mExpenses;

            // Income: Evaluate individually per month. Use Realized if reconciled, else Expected.
            foreach (var income in allIncome)
            {
                if (IsIncomeExpectedInMonth(income, year, m))
                {
                    var rec = reconciliations.FirstOrDefault(r => r.IncomeSourceId == income.Id && r.Month == m);
                    if (rec != null)
                    {
                        ytdIncome += rec.RealizedAmount;
                    }
                    else
                    {
                        ytdIncome += income.Amount;
                    }
                }
            }
        }

        return new SummaryDashboardStats
        {
            TotalIncome = expectedIncome,
            TotalExpenses = totalExpenses,
            ExpectedIncomes = expectedIncomeItems,
            YTDIncome = ytdIncome,
            YTDExpenses = ytdExpenses
        };
    }

    private bool IsIncomeExpectedInMonth(IncomeSource income, int targetYear, int targetMonth)
    {
        // A simplistic approach to recurring frequency mappings.
        // It determines if the income event "falls" into the target year/month combination.

        if (income.TargetDate.Year > targetYear || 
           (income.TargetDate.Year == targetYear && income.TargetDate.Month > targetMonth))
        {
            // The income hasn't started yet.
            return false;
        }

        switch (income.Frequency)
        {
            case IncomeFrequency.Monthly:
                return true; // Happens every month after start
                
            case IncomeFrequency.BiWeekly:
                 // Assuming 2 times a month strictly for standard monthly budgeting
                 return true; 
                 
            case IncomeFrequency.Quarterly:
                // Check if the target month is on the same quarterly cycle as the start month
                int monthsDifference = ((targetYear - income.TargetDate.Year) * 12) + targetMonth - income.TargetDate.Month;
                return monthsDifference % 3 == 0;
                
            case IncomeFrequency.Yearly:
                return income.TargetDate.Month == targetMonth;
                
            default:
                return false;
        }
    }

    private bool IsExpenseExpectedInMonth(ExpenseCategory expense, int targetYear, int targetMonth)
    {
        if (expense.TargetDate.Year > targetYear || 
           (expense.TargetDate.Year == targetYear && expense.TargetDate.Month > targetMonth))
        {
            return false;
        }

        switch (expense.Frequency)
        {
            case ExpenseFrequency.OneTime:
                return expense.TargetDate.Year == targetYear && expense.TargetDate.Month == targetMonth;

            case ExpenseFrequency.Monthly:
                return true; 
                 
            case ExpenseFrequency.Quarterly:
                int monthsDifference = ((targetYear - expense.TargetDate.Year) * 12) + targetMonth - expense.TargetDate.Month;
                return monthsDifference % 3 == 0;
                
            case ExpenseFrequency.Yearly:
                return expense.TargetDate.Month == targetMonth;
                
            default:
                return false;
        }
    }
}
