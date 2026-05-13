namespace Mind_Vault.Api.Models.Dtos;

public sealed record UserResponse(
    string Id,
    string Email,
    string UserName,
    IReadOnlyList<string> Roles);
