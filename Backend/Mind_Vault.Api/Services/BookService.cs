using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;
using Mind_Vault.Api.Repositories;

namespace Mind_Vault.Api.Services;

public sealed class BookService : IBookService
{
    private readonly IBookRepository _bookRepository;

    public BookService(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    public async Task<PagedResponse<BookResponse>> GetAllAsync(string userId, BookQueryRequest request)
    {
        var (items, totalCount) = await _bookRepository.GetAllByUserIdAsync(userId, request);
        var responses = items.Select(MapToResponse).ToList();
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)request.PageSize);

        return new PagedResponse<BookResponse>(responses, request.PageNumber, request.PageSize, totalCount, totalPages);
    }

    public async Task<BookResponse?> GetByIdAsync(int id, string userId)
    {
        var book = await _bookRepository.GetByIdAndUserIdAsync(id, userId);
        return book is null ? null : MapToResponse(book);
    }

    public async Task<BookResponse> CreateAsync(string userId, BookCreateRequest request)
    {
        var book = new Book
        {
            Text = request.Text,
            Author = request.Author,
            PublicationDate = request.PublicationDate,
            UserId = userId
        };

        await _bookRepository.AddAsync(book);
        await _bookRepository.SaveChangesAsync();

        return MapToResponse(book);
    }

    public async Task<bool> UpdateAsync(int id, string userId, BookUpdateRequest request)
    {
        var book = await _bookRepository.GetByIdAndUserIdAsync(id, userId);
        if (book is null)
        {
            return false;
        }

        book.Text = request.Text;
        book.Author = request.Author;
        book.PublicationDate = request.PublicationDate;

        await _bookRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var book = await _bookRepository.GetByIdAndUserIdAsync(id, userId);
        if (book is null)
        {
            return false;
        }

        _bookRepository.Remove(book);
        await _bookRepository.SaveChangesAsync();
        return true;
    }

    private static BookResponse MapToResponse(Book book)
    {
        return new BookResponse(book.Id, book.Text, book.Author, book.PublicationDate);
    }
}
