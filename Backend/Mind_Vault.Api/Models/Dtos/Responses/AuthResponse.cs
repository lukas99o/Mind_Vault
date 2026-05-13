namespace Mind_Vault.Api.Models.Dtos;

public sealed record AuthResponse(string Token, DateTime ExpiresAtUtc);
