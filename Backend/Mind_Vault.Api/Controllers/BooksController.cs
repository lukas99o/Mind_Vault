using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mind_Vault.Api.Models.Dtos;
using Mind_Vault.Api.Services;

namespace Mind_Vault.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BooksController : ApiControllerBase
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<BookResponse>>> GetAll([FromQuery] BookQueryRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return UnauthorizedError();
        }

        var books = await _bookService.GetAllAsync(userId, request);
        return Ok(books);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookResponse>> GetById(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return UnauthorizedError();
        }

        var book = await _bookService.GetByIdAsync(id, userId);
        if (book is null)
        {
            return NotFoundError("Book was not found.");
        }

        return Ok(book);
    }

    [HttpPost]
    public async Task<ActionResult<BookResponse>> Create(BookCreateRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return UnauthorizedError();
        }

        var createdBook = await _bookService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetById), new { id = createdBook.Id }, createdBook);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, BookUpdateRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return UnauthorizedError();
        }

        var wasUpdated = await _bookService.UpdateAsync(id, userId, request);
        if (!wasUpdated)
        {
            return NotFoundError("Book was not found.");
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return UnauthorizedError();
        }

        var wasDeleted = await _bookService.DeleteAsync(id, userId);
        if (!wasDeleted)
        {
            return NotFoundError("Book was not found.");
        }

        return NoContent();
    }
}
