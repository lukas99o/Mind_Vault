using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mind_Vault.Api.Models.Dtos;
using Mind_Vault.Api.Services;

namespace Mind_Vault.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class QuotesController : ApiControllerBase
{
    private readonly IQuoteService _quoteService;

    public QuotesController(IQuoteService quoteService)
    {
        _quoteService = quoteService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<QuoteResponse>>> GetAll([FromQuery] QuoteQueryRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return UnauthorizedError();
        }

        var quotes = await _quoteService.GetAllAsync(userId, request);
        return Ok(quotes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuoteResponse>> GetById(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return UnauthorizedError();
        }

        var quote = await _quoteService.GetByIdAsync(id, userId);
        if (quote is null)
        {
            return NotFoundError("Quote was not found.");
        }

        return Ok(quote);
    }

    [HttpPost]
    public async Task<ActionResult<QuoteResponse>> Create(QuoteCreateRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return UnauthorizedError();
        }

        var createdQuote = await _quoteService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetById), new { id = createdQuote.Id }, createdQuote);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, QuoteUpdateRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return UnauthorizedError();
        }

        var wasUpdated = await _quoteService.UpdateAsync(id, userId, request);
        if (!wasUpdated)
        {
            return NotFoundError("Quote was not found.");
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

        var wasDeleted = await _quoteService.DeleteAsync(id, userId);
        if (!wasDeleted)
        {
            return NotFoundError("Quote was not found.");
        }

        return NoContent();
    }
}
