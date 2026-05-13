using Microsoft.EntityFrameworkCore;
using Mind_Vault.Api.Data;
using Mind_Vault.Api.Models;

namespace Mind_Vault.Api.Repositories;

public sealed class QuoteRepository : IQuoteRepository
{
    private readonly ApplicationDbContext _context;

    public QuoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<List<Quote>> GetAllByUserIdAsync(string userId)
    {
        return _context.Quotes
            .Where(quote => quote.UserId == userId)
            .OrderByDescending(quote => quote.Id)
            .ToListAsync();
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
