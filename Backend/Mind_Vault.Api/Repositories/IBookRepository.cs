using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;

namespace Mind_Vault.Api.Repositories;

public interface IBookRepository
{
    Task<(IReadOnlyList<Book> Items, int TotalCount)> GetAllByUserIdAsync(string userId, BookQueryRequest request);
    Task<Book?> GetByIdAndUserIdAsync(int id, string userId);
    Task AddAsync(Book book);
    void Remove(Book book);
    Task SaveChangesAsync();
}
