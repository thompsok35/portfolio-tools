namespace api.Models;

public enum IncomeFrequency
{
    BiWeekly,
    Monthly,
    Quarterly,
    Yearly
}

public class IncomeSource
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    
    // Example: "Apple Dividends", "Main St Rental"
    public string Source { get; set; } = string.Empty;
    
    // Configurable Category (Dividend, Option Premium, IT Contract, Rental)
    public string Type { get; set; } = string.Empty;
    
    public IncomeFrequency Frequency { get; set; }
    
    // The specific date in the month this income is expected
    public DateTime TargetDate { get; set; }
    
    public string Description { get; set; } = string.Empty;
}
