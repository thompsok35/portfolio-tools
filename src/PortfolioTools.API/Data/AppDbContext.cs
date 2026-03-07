using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PortfolioTools.API.Models;

namespace PortfolioTools.API.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<IncomeSource> IncomeSources => Set<IncomeSource>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<IncomeType> IncomeTypes => Set<IncomeType>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<IncomeSource>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.IncomeType).WithMany().HasForeignKey(x => x.IncomeTypeId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.User).WithMany(u => u.IncomeSources).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ExpenseCategory>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.PlannedAmount).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.User).WithMany(u => u.ExpenseCategories).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<IncomeType>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.User).WithMany(u => u.IncomeTypes).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
