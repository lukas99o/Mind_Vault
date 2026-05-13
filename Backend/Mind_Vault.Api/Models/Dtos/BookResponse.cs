namespace Mind_Vault.Api.Models.Dtos;

public sealed record BookResponse(
    int Id,
    string Text,
    string Author,
    DateTime PublicationDate);
