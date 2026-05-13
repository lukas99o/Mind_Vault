using Mind_Vault.Api.Models;

namespace Mind_Vault.Api.Repositories;

public interface IQuoteRepository
{
    Task<List<Quote>> GetAllByUserIdAsync(string userId);
    Task<Quote?> GetByIdAndUserIdAsync(int id, string userId);
    Task AddAsync(Quote quote);
    void Remove(Quote quote);
    Task SaveChangesAsync();
}
