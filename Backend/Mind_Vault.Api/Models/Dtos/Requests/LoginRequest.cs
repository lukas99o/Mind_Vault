using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Mind_Vault.Api.Models.Dtos;

public sealed record LoginRequest(
    [property: EmailAddress]
    [property: Required]
    string Email, 
    
    [property: Required]
    [property: MinLength(8)]
    string Password
);
