using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<IncomeSource> IncomeSources { get; set; }
    public DbSet<ExpenseCategory> ExpenseCategories { get; set; }
    public DbSet<AppConfigCategory> AppConfigCategories { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Plan> Plans { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Define any constraints or seeds here if necessary later.
        modelBuilder.Entity<IncomeSource>()
            .Property(i => i.Amount)
            .HasColumnType("decimal(18,2)");
            
        modelBuilder.Entity<ExpenseCategory>()
            .Property(e => e.PlannedAmount)
            .HasColumnType("decimal(18,2)");

        // Initial Seed Data
        modelBuilder.Entity<AppConfigCategory>().HasData(
            new AppConfigCategory { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Group = "IncomeType", Value = "Dividend" },
            new AppConfigCategory { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Group = "IncomeType", Value = "Option Premium" },
            new AppConfigCategory { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Group = "IncomeType", Value = "Rental" }
        );

        modelBuilder.Entity<ExpenseCategory>().HasData(
            new ExpenseCategory { Id = Guid.NewGuid(), Name = "Rent/Mortgage", IsFixed = true, PlannedAmount = 1500.00m },
            new ExpenseCategory { Id = Guid.NewGuid(), Name = "Groceries", IsFixed = false, PlannedAmount = 400.00m },
            new ExpenseCategory { Id = Guid.NewGuid(), Name = "Healthcare", IsFixed = true, PlannedAmount = 350.00m }
        );
    }
}
