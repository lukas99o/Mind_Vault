using Mind_Vault.Api.Models;

namespace Mind_Vault.Api.Repositories;

public interface IBookRepository
{
    Task<List<Book>> GetAllByUserIdAsync(string userId);
    Task<Book?> GetByIdAndUserIdAsync(int id, string userId);
    Task AddAsync(Book book);
    void Remove(Book book);
    Task SaveChangesAsync();
}
