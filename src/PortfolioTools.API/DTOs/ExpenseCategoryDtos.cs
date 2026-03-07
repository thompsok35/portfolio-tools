namespace PortfolioTools.API.DTOs;

public class ExpenseCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsFixed { get; set; }
    public decimal PlannedAmount { get; set; }
    public bool IsActive { get; set; }
}

public class CreateExpenseCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsFixed { get; set; }
    public decimal PlannedAmount { get; set; }
}

public class UpdateExpenseCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsFixed { get; set; }
    public decimal PlannedAmount { get; set; }
    public bool IsActive { get; set; }
}
