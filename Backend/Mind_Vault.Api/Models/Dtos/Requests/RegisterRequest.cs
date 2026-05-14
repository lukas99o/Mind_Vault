using System.ComponentModel.DataAnnotations;

namespace Mind_Vault.Api.Models.Dtos;

public sealed record RegisterRequest(
    [property: Required]
    [property: EmailAddress] 
    string Email, 
    
    [property: Required]
    [property: MinLength(8)]
    string Password
);