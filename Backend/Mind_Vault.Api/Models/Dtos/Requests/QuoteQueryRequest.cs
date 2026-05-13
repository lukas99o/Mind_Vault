using System.ComponentModel.DataAnnotations;

namespace Mind_Vault.Api.Models.Dtos;

public sealed class QuoteQueryRequest : PagedRequest
{
    [StringLength(200)]
    public string? Author { get; set; }

    [StringLength(1000)]
    public string? SearchText { get; set; }

    [RegularExpression("^(created|author|text)$")]
    public string SortBy { get; set; } = "created";

    public bool SortDescending { get; set; } = true;
}
