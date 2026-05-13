namespace Mind_Vault.Api.Models.Dtos;

public sealed record UserListResponse(IReadOnlyList<UserResponse> Users, int Total);
