using System.ComponentModel.DataAnnotations;

namespace Mind_Vault.Api.Models.Dtos;

public sealed class BookCreateRequest
{
    [Required]
    [StringLength(1000)]
    public string Text { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Author { get; set; } = string.Empty;

    public DateTime PublicationDate { get; set; }
}
