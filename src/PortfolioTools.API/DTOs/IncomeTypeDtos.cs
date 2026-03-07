namespace PortfolioTools.API.DTOs;

public class IncomeTypeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CreateIncomeTypeRequest
{
    public string Name { get; set; } = string.Empty;
}
