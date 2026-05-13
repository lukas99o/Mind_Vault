using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;
using Mind_Vault.Api.Repositories;

namespace Mind_Vault.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/users/{userId}/books")]
public class AdminUserBooksController : ApiControllerBase
{
    private readonly IBookRepository _bookRepository;

    public AdminUserBooksController(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<BookResponse>>> GetUserBooks(string userId, [FromQuery] BookQueryRequest request)
    {
        var (items, totalCount) = await _bookRepository.GetAllByIdAsync(userId, request);
        var responses = items.Select(MapToResponse).ToList();
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)request.PageSize);

        return Ok(new PagedResponse<BookResponse>(responses, request.PageNumber, request.PageSize, totalCount, totalPages));
    }

    [HttpGet("{bookId:int}")]
    public async Task<ActionResult<BookResponse>> GetUserBook(string userId, int bookId)
    {
        var book = await _bookRepository.GetByIdAsync(bookId, userId);
        if (book is null || book.UserId != userId)
        {
            return NotFoundError("Book was not found.");
        }

        return Ok(MapToResponse(book));
    }

    [HttpPost]
    public async Task<ActionResult<BookResponse>> CreateBookForUser(string userId, BookCreateRequest request)
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

        return CreatedAtAction(nameof(GetUserBook), new { userId, bookId = book.Id }, MapToResponse(book));
    }

    [HttpPut("{bookId:int}")]
    public async Task<IActionResult> UpdateUserBook(string userId, int bookId, BookUpdateRequest request)
    {
        var book = await _bookRepository.GetByIdAsync(bookId, userId);
        if (book is null || book.UserId != userId)
        {
            return NotFoundError("Book was not found.");
        }

        book.Text = request.Text;
        book.Author = request.Author;
        book.PublicationDate = request.PublicationDate;

        await _bookRepository.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{bookId:int}")]
    public async Task<IActionResult> DeleteUserBook(string userId, int bookId)
    {
        var book = await _bookRepository.GetByIdAsync(bookId, userId);
        if (book is null || book.UserId != userId)
        {
            return NotFoundError("Book was not found.");
        }

        _bookRepository.Remove(book);
        await _bookRepository.SaveChangesAsync();
        return NoContent();
    }

    private static BookResponse MapToResponse(Book book)
    {
        return new BookResponse(book.Id, book.Text, book.Author, book.PublicationDate);
    }
}
