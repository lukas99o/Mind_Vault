using Microsoft.EntityFrameworkCore;
using Mind_Vault.Api.Data;
using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;

namespace Mind_Vault.Api.Repositories;

public sealed class QuoteRepository : IQuoteRepository
{
    private readonly ApplicationDbContext _context;

    public QuoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<Quote> Items, int TotalCount)> GetAllByUserIdAsync(string userId, QuoteQueryRequest request)
    {
        var query = _context.Quotes
            .Where(quote => quote.UserId == userId);

        if (!string.IsNullOrWhiteSpace(request.Author))
        {
            query = query.Where(quote => quote.Author.Contains(request.Author));
        }

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            query = query.Where(quote => quote.Text.Contains(request.SearchText));
        }

        query = request.SortBy.ToLowerInvariant() switch
        {
            "author" => request.SortDescending
                ? query.OrderByDescending(quote => quote.Author).ThenByDescending(quote => quote.Id)
                : query.OrderBy(quote => quote.Author).ThenBy(quote => quote.Id),
            "text" => request.SortDescending
                ? query.OrderByDescending(quote => quote.Text).ThenByDescending(quote => quote.Id)
                : query.OrderBy(quote => quote.Text).ThenBy(quote => quote.Id),
            _ => request.SortDescending
                ? query.OrderByDescending(quote => quote.Id)
                : query.OrderBy(quote => quote.Id)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public Task<Quote?> GetByIdAndUserIdAsync(int id, string userId)
    {
        return _context.Quotes
            .FirstOrDefaultAsync(quote => quote.Id == id && quote.UserId == userId);
    }

    public async Task AddAsync(Quote quote)
    {
        await _context.Quotes.AddAsync(quote);
    }

    public void Remove(Quote quote)
    {
        _context.Quotes.Remove(quote);
    }

    public Task SaveChangesAsync()
    {
        return _context.SaveChangesAsync();
    }
}
