namespace api.Models;

public class AppConfigCategory
{
    public Guid Id { get; set; }
    
    // E.g., "IncomeType", "ExpenseCategory"
    public string Group { get; set; } = string.Empty;
    
    // E.g., "Dividend", "Option Premium", "Groceries", "Rent"
    public string Value { get; set; } = string.Empty;
}
