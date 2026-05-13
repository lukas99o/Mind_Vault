namespace Mind_Vault.Api.Models.Dtos;

public sealed record ApiErrorResponse(
    int StatusCode,
    string Message,
    Dictionary<string, string[]>? Errors = null);
