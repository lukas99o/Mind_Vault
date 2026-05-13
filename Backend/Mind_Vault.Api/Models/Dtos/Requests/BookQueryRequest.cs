using System.ComponentModel.DataAnnotations;

namespace Mind_Vault.Api.Models.Dtos;

public sealed class BookQueryRequest : PagedRequest
{
    [StringLength(200)]
    public string? Author { get; set; }

    [StringLength(1000)]
    public string? SearchText { get; set; }

    public DateTime? PublicationDateFrom { get; set; }

    public DateTime? PublicationDateTo { get; set; }

    [RegularExpression("^(publicationDate|author|text)$")]
    public string SortBy { get; set; } = "publicationDate";

    public bool SortDescending { get; set; } = true;

    public override IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        foreach (var validationResult in base.Validate(validationContext))
        {
            yield return validationResult;
        }

        if (PublicationDateFrom.HasValue && PublicationDateTo.HasValue && PublicationDateFrom > PublicationDateTo)
        {
            yield return new ValidationResult(
                "PublicationDateFrom must be earlier than or equal to PublicationDateTo.",
                [nameof(PublicationDateFrom), nameof(PublicationDateTo)]);
        }
    }
}
