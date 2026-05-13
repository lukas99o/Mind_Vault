using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;
using Mind_Vault.Api.Repositories;

namespace Mind_Vault.Api.Services;

public sealed class QuoteService : IQuoteService
{
    private readonly IQuoteRepository _quoteRepository;

    public QuoteService(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    public async Task<PagedResponse<QuoteResponse>> GetAllAsync(string userId, QuoteQueryRequest request)
    {
        var (items, totalCount) = await _quoteRepository.GetAllByUserIdAsync(userId, request);
        var responses = items.Select(MapToResponse).ToList();
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)request.PageSize);

        return new PagedResponse<QuoteResponse>(responses, request.PageNumber, request.PageSize, totalCount, totalPages);
    }

    public async Task<QuoteResponse?> GetByIdAsync(int id, string userId)
    {
        var quote = await _quoteRepository.GetByIdAndUserIdAsync(id, userId);
        return quote is null ? null : MapToResponse(quote);
    }

    public async Task<QuoteResponse> CreateAsync(string userId, QuoteCreateRequest request)
    {
        var quote = new Quote
        {
            Text = request.Text,
            Author = request.Author,
            UserId = userId
        };

        await _quoteRepository.AddAsync(quote);
        await _quoteRepository.SaveChangesAsync();

        return MapToResponse(quote);
    }

    public async Task<bool> UpdateAsync(int id, string userId, QuoteUpdateRequest request)
    {
        var quote = await _quoteRepository.GetByIdAndUserIdAsync(id, userId);
        if (quote is null)
        {
            return false;
        }

        quote.Text = request.Text;
        quote.Author = request.Author;

        await _quoteRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var quote = await _quoteRepository.GetByIdAndUserIdAsync(id, userId);
        if (quote is null)
        {
            return false;
        }

        _quoteRepository.Remove(quote);
        await _quoteRepository.SaveChangesAsync();
        return true;
    }

    private static QuoteResponse MapToResponse(Quote quote)
    {
        return new QuoteResponse(quote.Id, quote.Text, quote.Author);
    }
}
