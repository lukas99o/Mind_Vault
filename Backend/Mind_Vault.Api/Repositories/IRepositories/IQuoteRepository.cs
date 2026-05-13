using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;

namespace Mind_Vault.Api.Repositories;

public interface IQuoteRepository
{
    Task<(IReadOnlyList<Quote> Items, int TotalCount)> GetAllByIdAsync(string userId, QuoteQueryRequest request);
    Task<Quote?> GetByIdAsync(int id, string userId);
    Task AddAsync(Quote quote);
    void Remove(Quote quote);
    Task SaveChangesAsync();
}
