namespace api.Models;

public enum ExpenseFrequency
{
    OneTime,
    Monthly,
    Quarterly,
    Yearly
}

public class ExpenseCategory
{
    public Guid Id { get; set; }
    
    // Example: Rent/Mortgage, Taxes, Healthcare, Groceries
    public string Name { get; set; } = string.Empty;
    
    public bool IsFixed { get; set; }
    
    public decimal PlannedAmount { get; set; }

    public ExpenseFrequency Frequency { get; set; }
    
    public DateTime TargetDate { get; set; }

    public Guid PlanId { get; set; }
}
