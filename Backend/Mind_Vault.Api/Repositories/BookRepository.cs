using Microsoft.EntityFrameworkCore;
using Mind_Vault.Api.Data;
using Mind_Vault.Api.Models;

namespace Mind_Vault.Api.Repositories;

public sealed class BookRepository : IBookRepository
{
    private readonly ApplicationDbContext _context;

    public BookRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<List<Book>> GetAllByUserIdAsync(string userId)
    {
        return _context.Books
            .Where(book => book.UserId == userId)
            .OrderByDescending(book => book.PublicationDate)
            .ToListAsync();
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
