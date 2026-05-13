using System.ComponentModel.DataAnnotations;

namespace Mind_Vault.Api.Models.Dtos;

public abstract class PagedRequest : IValidatableObject
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 10;

    public virtual IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        yield break;
    }
}
