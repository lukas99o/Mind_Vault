using Mind_Vault.Api.Models.Dtos;

namespace Mind_Vault.Api.Services;

public interface IQuoteService
{
    Task<IReadOnlyList<QuoteResponse>> GetAllAsync(string userId);
    Task<QuoteResponse?> GetByIdAsync(int id, string userId);
    Task<QuoteResponse> CreateAsync(string userId, QuoteCreateRequest request);
    Task<bool> UpdateAsync(int id, string userId, QuoteUpdateRequest request);
    Task<bool> DeleteAsync(int id, string userId);
}
