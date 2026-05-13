using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mind_Vault.Api.Models.Dtos;
using Mind_Vault.Api.Services;

namespace Mind_Vault.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class QuotesController : ControllerBase
{
    private readonly IQuoteService _quoteService;

    public QuotesController(IQuoteService quoteService)
    {
        _quoteService = quoteService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<QuoteResponse>>> GetAll()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var quotes = await _quoteService.GetAllAsync(userId);
        return Ok(quotes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuoteResponse>> GetById(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var quote = await _quoteService.GetByIdAsync(id, userId);
        if (quote is null)
        {
            return NotFound();
        }

        return Ok(quote);
    }

    [HttpPost]
    public async Task<ActionResult<QuoteResponse>> Create(QuoteCreateRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
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
            return Unauthorized();
        }

        var wasUpdated = await _quoteService.UpdateAsync(id, userId, request);
        if (!wasUpdated)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var wasDeleted = await _quoteService.DeleteAsync(id, userId);
        if (!wasDeleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    private string? GetCurrentUserId()
    {
        // NameIdentifier is set when the JWT token is created.
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
