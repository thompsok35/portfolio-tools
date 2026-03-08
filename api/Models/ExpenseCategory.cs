namespace api.Models;

public class ExpenseCategory
{
    public Guid Id { get; set; }
    
    // Example: Rent/Mortgage, Taxes, Healthcare, Groceries
    public string Name { get; set; } = string.Empty;
    
    public bool IsFixed { get; set; }
    
    public decimal PlannedAmount { get; set; }
}
