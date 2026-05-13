namespace Mind_Vault.Api.Models.Dtos;

public sealed record QuoteResponse(
    int Id,
    string Text,
    string Author);
