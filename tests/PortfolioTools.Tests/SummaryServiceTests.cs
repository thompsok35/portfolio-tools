using Microsoft.EntityFrameworkCore;
using PortfolioTools.API.Data;
using PortfolioTools.API.Models;
using PortfolioTools.API.Services;
using Xunit;

namespace PortfolioTools.Tests;

public class SummaryServiceTests
{
    private static AppDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static IncomeType CreateType(AppDbContext db, string userId, string name)
    {
        var type = new IncomeType { Name = name, UserId = userId };
        db.IncomeTypes.Add(type);
        db.SaveChanges();
        return type;
    }

    [Fact]
    public async Task GetMonthlySummary_MonthlyIncome_AppearsEveryMonth()
    {
        var db = CreateInMemoryDb();
        var userId = "user1";
        var type = CreateType(db, userId, "Salary");

        db.IncomeSources.Add(new IncomeSource
        {
            Amount = 5000m,
            Source = "Job",
            IncomeTypeId = type.Id,
            Frequency = IncomeFrequency.Monthly,
            TargetDate = new DateTime(2025, 1, 15),
            UserId = userId,
            IsActive = true
        });
        await db.SaveChangesAsync();

        var service = new SummaryService(db);

        // Monthly income should appear in every month
        for (int month = 1; month <= 12; month++)
        {
            var summary = await service.GetMonthlySummaryAsync(userId, 2025, month);
            Assert.Equal(5000m, summary.TotalIncome);
        }
    }

    [Fact]
    public async Task GetMonthlySummary_QuarterlyIncome_AppearsInCorrectMonths()
    {
        var db = CreateInMemoryDb();
        var userId = "user2";
        var type = CreateType(db, userId, "Dividend");

        // Target in March => should apply in March, June, September, December
        db.IncomeSources.Add(new IncomeSource
        {
            Amount = 1200m,
            Source = "Apple Dividends",
            IncomeTypeId = type.Id,
            Frequency = IncomeFrequency.Quarterly,
            TargetDate = new DateTime(2025, 3, 15),
            UserId = userId,
            IsActive = true
        });
        await db.SaveChangesAsync();

        var service = new SummaryService(db);

        var quarterlyMonths = new[] { 3, 6, 9, 12 };
        var nonQuarterlyMonths = new[] { 1, 2, 4, 5, 7, 8, 10, 11 };

        foreach (var month in quarterlyMonths)
        {
            var summary = await service.GetMonthlySummaryAsync(userId, 2025, month);
            Assert.Equal(1200m, summary.TotalIncome);
        }

        foreach (var month in nonQuarterlyMonths)
        {
            var summary = await service.GetMonthlySummaryAsync(userId, 2025, month);
            Assert.Equal(0m, summary.TotalIncome);
        }
    }

    [Fact]
    public async Task GetMonthlySummary_YearlyIncome_AppearsOnlyInTargetMonth()
    {
        var db = CreateInMemoryDb();
        var userId = "user3";
        var type = CreateType(db, userId, "Bonus");

        db.IncomeSources.Add(new IncomeSource
        {
            Amount = 10000m,
            Source = "Annual Bonus",
            IncomeTypeId = type.Id,
            Frequency = IncomeFrequency.Yearly,
            TargetDate = new DateTime(2025, 6, 1),
            UserId = userId,
            IsActive = true
        });
        await db.SaveChangesAsync();

        var service = new SummaryService(db);

        for (int month = 1; month <= 12; month++)
        {
            var summary = await service.GetMonthlySummaryAsync(userId, 2025, month);
            if (month == 6)
                Assert.Equal(10000m, summary.TotalIncome);
            else
                Assert.Equal(0m, summary.TotalIncome);
        }
    }

    [Fact]
    public async Task GetMonthlySummary_NetSurplusDeficit_CalculatedCorrectly()
    {
        var db = CreateInMemoryDb();
        var userId = "user4";
        var type = CreateType(db, userId, "Salary");

        db.IncomeSources.Add(new IncomeSource
        {
            Amount = 6000m,
            Source = "Main Job",
            IncomeTypeId = type.Id,
            Frequency = IncomeFrequency.Monthly,
            TargetDate = new DateTime(2025, 1, 1),
            UserId = userId,
            IsActive = true
        });

        db.ExpenseCategories.Add(new ExpenseCategory
        {
            Name = "Rent",
            IsFixed = true,
            PlannedAmount = 2000m,
            UserId = userId,
            IsActive = true
        });
        db.ExpenseCategories.Add(new ExpenseCategory
        {
            Name = "Groceries",
            IsFixed = false,
            PlannedAmount = 500m,
            UserId = userId,
            IsActive = true
        });
        await db.SaveChangesAsync();

        var service = new SummaryService(db);
        var summary = await service.GetMonthlySummaryAsync(userId, 2025, 1);

        Assert.Equal(6000m, summary.TotalIncome);
        Assert.Equal(2500m, summary.TotalExpenses);
        Assert.Equal(3500m, summary.NetSurplusDeficit);
    }

    [Fact]
    public async Task GetMonthlySummary_InactiveSource_IsExcluded()
    {
        var db = CreateInMemoryDb();
        var userId = "user5";
        var type = CreateType(db, userId, "Salary");

        db.IncomeSources.Add(new IncomeSource
        {
            Amount = 3000m,
            Source = "Old Job",
            IncomeTypeId = type.Id,
            Frequency = IncomeFrequency.Monthly,
            TargetDate = new DateTime(2025, 1, 1),
            UserId = userId,
            IsActive = false // inactive
        });
        await db.SaveChangesAsync();

        var service = new SummaryService(db);
        var summary = await service.GetMonthlySummaryAsync(userId, 2025, 1);

        Assert.Equal(0m, summary.TotalIncome);
    }

    [Fact]
    public async Task GetQuarterlySummary_AggregatesMonthlyBreakdown()
    {
        var db = CreateInMemoryDb();
        var userId = "user6";
        var type = CreateType(db, userId, "Salary");

        db.IncomeSources.Add(new IncomeSource
        {
            Amount = 4000m,
            Source = "Monthly Pay",
            IncomeTypeId = type.Id,
            Frequency = IncomeFrequency.Monthly,
            TargetDate = new DateTime(2025, 1, 15),
            UserId = userId,
            IsActive = true
        });

        db.ExpenseCategories.Add(new ExpenseCategory
        {
            Name = "Utilities",
            IsFixed = true,
            PlannedAmount = 1000m,
            UserId = userId,
            IsActive = true
        });
        await db.SaveChangesAsync();

        var service = new SummaryService(db);
        var summary = await service.GetQuarterlySummaryAsync(userId, 2025, 1); // Q1: Jan-Mar

        Assert.Equal(3, summary.MonthlyBreakdown.Count);
        Assert.Equal(12000m, summary.TotalIncome);   // 3 months * 4000
        Assert.Equal(3000m, summary.TotalExpenses);  // 3 months * 1000
        Assert.Equal(9000m, summary.NetSurplusDeficit);
    }

    [Fact]
    public async Task GetQuarterlySummary_InvalidQuarter_ThrowsException()
    {
        var db = CreateInMemoryDb();
        var service = new SummaryService(db);

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() =>
            service.GetQuarterlySummaryAsync("any-user", 2025, 5));
    }

    [Fact]
    public async Task GetMonthlySummary_BiMonthlyIncome_AppearsInAlternateMonths()
    {
        var db = CreateInMemoryDb();
        var userId = "user7";
        var type = CreateType(db, userId, "Rental");

        // Target in January -> should apply Jan, Mar, May, Jul, Sep, Nov
        db.IncomeSources.Add(new IncomeSource
        {
            Amount = 2000m,
            Source = "Rental Income",
            IncomeTypeId = type.Id,
            Frequency = IncomeFrequency.BiMonthly,
            TargetDate = new DateTime(2025, 1, 1),
            UserId = userId,
            IsActive = true
        });
        await db.SaveChangesAsync();

        var service = new SummaryService(db);

        var expectedMonths = new[] { 1, 3, 5, 7, 9, 11 };
        var skippedMonths = new[] { 2, 4, 6, 8, 10, 12 };

        foreach (var month in expectedMonths)
        {
            var summary = await service.GetMonthlySummaryAsync(userId, 2025, month);
            Assert.Equal(2000m, summary.TotalIncome);
        }

        foreach (var month in skippedMonths)
        {
            var summary = await service.GetMonthlySummaryAsync(userId, 2025, month);
            Assert.Equal(0m, summary.TotalIncome);
        }
    }

    [Fact]
    public async Task GetMonthlySummary_UserIsolation_DoesNotReturnOtherUsersData()
    {
        var db = CreateInMemoryDb();
        var type1 = CreateType(db, "alice", "Salary");
        var type2 = CreateType(db, "bob", "Salary");

        db.IncomeSources.Add(new IncomeSource
        {
            Amount = 5000m,
            Source = "Alice's Job",
            IncomeTypeId = type1.Id,
            Frequency = IncomeFrequency.Monthly,
            TargetDate = new DateTime(2025, 1, 1),
            UserId = "alice",
            IsActive = true
        });
        db.IncomeSources.Add(new IncomeSource
        {
            Amount = 7000m,
            Source = "Bob's Job",
            IncomeTypeId = type2.Id,
            Frequency = IncomeFrequency.Monthly,
            TargetDate = new DateTime(2025, 1, 1),
            UserId = "bob",
            IsActive = true
        });
        await db.SaveChangesAsync();

        var service = new SummaryService(db);

        var aliceSummary = await service.GetMonthlySummaryAsync("alice", 2025, 1);
        var bobSummary = await service.GetMonthlySummaryAsync("bob", 2025, 1);

        Assert.Equal(5000m, aliceSummary.TotalIncome);
        Assert.Equal(7000m, bobSummary.TotalIncome);
    }
}
