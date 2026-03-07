using PortfolioTools.API.Models;

namespace PortfolioTools.API.DTOs;

public class IncomeSourceDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Source { get; set; } = string.Empty;
    public Guid IncomeTypeId { get; set; }
    public string? IncomeTypeName { get; set; }
    public IncomeFrequency Frequency { get; set; }
    public DateTime TargetDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateIncomeSourceRequest
{
    public decimal Amount { get; set; }
    public string Source { get; set; } = string.Empty;
    public Guid IncomeTypeId { get; set; }
    public IncomeFrequency Frequency { get; set; }
    public DateTime TargetDate { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class UpdateIncomeSourceRequest
{
    public decimal Amount { get; set; }
    public string Source { get; set; } = string.Empty;
    public Guid IncomeTypeId { get; set; }
    public IncomeFrequency Frequency { get; set; }
    public DateTime TargetDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
