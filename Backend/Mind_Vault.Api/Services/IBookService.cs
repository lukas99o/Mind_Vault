using Mind_Vault.Api.Models.Dtos;

namespace Mind_Vault.Api.Services;

public interface IBookService
{
    Task<PagedResponse<BookResponse>> GetAllAsync(string userId, BookQueryRequest request);
    Task<BookResponse?> GetByIdAsync(int id, string userId);
    Task<BookResponse> CreateAsync(string userId, BookCreateRequest request);
    Task<bool> UpdateAsync(int id, string userId, BookUpdateRequest request);
    Task<bool> DeleteAsync(int id, string userId);
}
