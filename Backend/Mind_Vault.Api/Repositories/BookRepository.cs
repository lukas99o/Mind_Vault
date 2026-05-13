using Microsoft.EntityFrameworkCore;
using Mind_Vault.Api.Data;
using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;

namespace Mind_Vault.Api.Repositories;

public sealed class BookRepository : IBookRepository
{
    private readonly ApplicationDbContext _context;

    public BookRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<Book> Items, int TotalCount)> GetAllByUserIdAsync(string userId, BookQueryRequest request)
    {
        var query = _context.Books
            .Where(book => book.UserId == userId);

        if (!string.IsNullOrWhiteSpace(request.Author))
        {
            query = query.Where(book => book.Author.Contains(request.Author));
        }

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            query = query.Where(book => book.Text.Contains(request.SearchText));
        }

        if (request.PublicationDateFrom.HasValue)
        {
            query = query.Where(book => book.PublicationDate >= request.PublicationDateFrom.Value);
        }

        if (request.PublicationDateTo.HasValue)
        {
            query = query.Where(book => book.PublicationDate <= request.PublicationDateTo.Value);
        }

        query = request.SortBy.ToLowerInvariant() switch
        {
            "author" => request.SortDescending
                ? query.OrderByDescending(book => book.Author).ThenByDescending(book => book.Id)
                : query.OrderBy(book => book.Author).ThenBy(book => book.Id),
            "text" => request.SortDescending
                ? query.OrderByDescending(book => book.Text).ThenByDescending(book => book.Id)
                : query.OrderBy(book => book.Text).ThenBy(book => book.Id),
            _ => request.SortDescending
                ? query.OrderByDescending(book => book.PublicationDate).ThenByDescending(book => book.Id)
                : query.OrderBy(book => book.PublicationDate).ThenBy(book => book.Id)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public Task<Book?> GetByIdAndUserIdAsync(int id, string userId)
    {
        return _context.Books
            .FirstOrDefaultAsync(book => book.Id == id && book.UserId == userId);
    }

    public async Task AddAsync(Book book)
    {
        await _context.Books.AddAsync(book);
    }

    public void Remove(Book book)
    {
        _context.Books.Remove(book);
    }

    public Task SaveChangesAsync()
    {
        return _context.SaveChangesAsync();
    }
}
