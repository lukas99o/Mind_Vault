using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;
using Mind_Vault.Api.Repositories;

namespace Mind_Vault.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/users/{userId}/quotes")]
public class AdminUserQuotesController : ApiControllerBase
{
    private readonly IQuoteRepository _quoteRepository;

    public AdminUserQuotesController(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<QuoteResponse>>> GetUserQuotes(string userId, [FromQuery] QuoteQueryRequest request)
    {
        var (items, totalCount) = await _quoteRepository.GetAllByIdAsync(userId, request);
        var responses = items.Select(MapToResponse).ToList();
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)request.PageSize);

        return Ok(new PagedResponse<QuoteResponse>(responses, request.PageNumber, request.PageSize, totalCount, totalPages));
    }

    [HttpGet("{quoteId:int}")]
    public async Task<ActionResult<QuoteResponse>> GetUserQuote(string userId, int quoteId)
    {
        var quote = await _quoteRepository.GetByIdAsync(quoteId, userId);
        if (quote is null || quote.UserId != userId)
        {
            return NotFoundError("Quote was not found.");
        }

        return Ok(MapToResponse(quote));
    }

    [HttpPost]
    public async Task<ActionResult<QuoteResponse>> CreateQuoteForUser(string userId, QuoteCreateRequest request)
    {
        var quote = new Quote
        {
            Text = request.Text,
            Author = request.Author,
            UserId = userId
        };

        await _quoteRepository.AddAsync(quote);
        await _quoteRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUserQuote), new { userId, quoteId = quote.Id }, MapToResponse(quote));
    }

    [HttpPut("{quoteId:int}")]
    public async Task<IActionResult> UpdateUserQuote(string userId, int quoteId, QuoteUpdateRequest request)
    {
        var quote = await _quoteRepository.GetByIdAsync(quoteId, userId);
        if (quote is null || quote.UserId != userId)
        {
            return NotFoundError("Quote was not found.");
        }

        quote.Text = request.Text;
        quote.Author = request.Author;

        await _quoteRepository.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{quoteId:int}")]
    public async Task<IActionResult> DeleteUserQuote(string userId, int quoteId)
    {
        var quote = await _quoteRepository.GetByIdAsync(quoteId, userId);
        if (quote is null || quote.UserId != userId)
        {
            return NotFoundError("Quote was not found.");
        }

        _quoteRepository.Remove(quote);
        await _quoteRepository.SaveChangesAsync();
        return NoContent();
    }

    private static QuoteResponse MapToResponse(Quote quote)
    {
        return new QuoteResponse(quote.Id, quote.Text, quote.Author);
    }
}
