using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;
using Mind_Vault.Api.Repositories;
using Mind_Vault.Tests.Repositories.Fixtures;

namespace Mind_Vault.Tests.Repositories;

public sealed class QuoteRepositoryTests : IAsyncLifetime
{
    private const string User1Id = "user-1";
    private const string User2Id = "user-2";
    private readonly RepositoryFixture _fixture = new();
    private QuoteRepository _repository = null!;

    public Task InitializeAsync() => _fixture.InitializeAsync();
    public Task DisposeAsync() => _fixture.DisposeAsync();

    [Fact]
    public async Task GetAllByIdAsync_FiltersByUserId_ExcludesOtherUsersQuotes()
    {
        var user1Quotes = new[]
        {
            new Quote { Text = "Quote 1", Author = "Author A", UserId = User1Id },
            new Quote { Text = "Quote 2", Author = "Author B", UserId = User1Id }
        };
        var user2Quotes = new[]
        {
            new Quote { Text = "Quote 3", Author = "Author C", UserId = User2Id }
        };
        await _fixture.Context.Quotes.AddRangeAsync(user1Quotes.Concat(user2Quotes));
        await _fixture.Context.SaveChangesAsync();
        _repository = new QuoteRepository(_fixture.Context);
        var request = new QuoteQueryRequest();

        var (items, totalCount) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Should().HaveCount(2);
        totalCount.Should().Be(2);
        items.Should().AllSatisfy(quote => quote.UserId.Should().Be(User1Id));
    }

    [Fact]
    public async Task GetAllByIdAsync_FiltersByAuthor_ReturnsQuotesContainingAuthorName()
    {
        var quotes = new[]
        {
            new Quote { Text = "Quote", Author = "Steve Jobs", UserId = User1Id },
            new Quote { Text = "Quote", Author = "Bill Gates", UserId = User1Id },
            new Quote { Text = "Quote", Author = "Elon Musk", UserId = User1Id }
        };
        await _fixture.Context.Quotes.AddRangeAsync(quotes);
        await _fixture.Context.SaveChangesAsync();
        _repository = new QuoteRepository(_fixture.Context);
        var request = new QuoteQueryRequest { Author = "Steve" };

        var (items, totalCount) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Should().HaveCount(1);
        totalCount.Should().Be(1);
        items.First().Author.Should().Be("Steve Jobs");
    }

    [Fact]
    public async Task GetAllByIdAsync_FiltersBySearchText_ReturnsQuotesContainingText()
    {
        var quotes = new[]
        {
            new Quote { Text = "Stay hungry stay foolish", Author = "Author", UserId = User1Id },
            new Quote { Text = "The only way out is through", Author = "Author", UserId = User1Id },
            new Quote { Text = "No match here", Author = "Author", UserId = User1Id }
        };
        await _fixture.Context.Quotes.AddRangeAsync(quotes);
        await _fixture.Context.SaveChangesAsync();
        _repository = new QuoteRepository(_fixture.Context);
        var request = new QuoteQueryRequest { SearchText = "stay" };

        var (items, totalCount) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Should().HaveCount(1);
        totalCount.Should().Be(1);
        items.First().Text.Should().Contain("stay");
    }

    [Fact]
    public async Task GetAllByIdAsync_SortByAuthorAscending_ReturnsSortedByAuthor()
    {
        var quotes = new[]
        {
            new Quote { Text = "Quote", Author = "Zapata", UserId = User1Id },
            new Quote { Text = "Quote", Author = "Anderson", UserId = User1Id },
            new Quote { Text = "Quote", Author = "Martinez", UserId = User1Id }
        };
        await _fixture.Context.Quotes.AddRangeAsync(quotes);
        await _fixture.Context.SaveChangesAsync();
        _repository = new QuoteRepository(_fixture.Context);
        var request = new QuoteQueryRequest { SortBy = "author", SortDescending = false };

        var (items, _) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Select(q => q.Author).Should().Equal("Anderson", "Martinez", "Zapata");
    }

    [Fact]
    public async Task GetAllByIdAsync_SortByAuthorDescending_ReturnsSortedByAuthorDesc()
    {
        var quotes = new[]
        {
            new Quote { Text = "Quote", Author = "Zapata", UserId = User1Id },
            new Quote { Text = "Quote", Author = "Anderson", UserId = User1Id },
            new Quote { Text = "Quote", Author = "Martinez", UserId = User1Id }
        };
        await _fixture.Context.Quotes.AddRangeAsync(quotes);
        await _fixture.Context.SaveChangesAsync();
        _repository = new QuoteRepository(_fixture.Context);
        var request = new QuoteQueryRequest { SortBy = "author", SortDescending = true };

        var (items, _) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Select(q => q.Author).Should().Equal("Zapata", "Martinez", "Anderson");
    }

    [Fact]
    public async Task GetAllByIdAsync_SortByTextAscending_ReturnsSortedByText()
    {
        var quotes = new[]
        {
            new Quote { Text = "Zulu quote", Author = "Author", UserId = User1Id },
            new Quote { Text = "Alpha quote", Author = "Author", UserId = User1Id },
            new Quote { Text = "Mike quote", Author = "Author", UserId = User1Id }
        };
        await _fixture.Context.Quotes.AddRangeAsync(quotes);
        await _fixture.Context.SaveChangesAsync();
        _repository = new QuoteRepository(_fixture.Context);
        var request = new QuoteQueryRequest { SortBy = "text", SortDescending = false };

        var (items, _) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Select(q => q.Text).Should().Equal("Alpha quote", "Mike quote", "Zulu quote");
    }

    [Fact]
    public async Task GetAllByIdAsync_DefaultSortByIdDescending_ReturnsSortedByIdDesc()
    {
        var quotes = new[]
        {
            new Quote { Text = "First", Author = "Author", UserId = User1Id },
            new Quote { Text = "Second", Author = "Author", UserId = User1Id },
            new Quote { Text = "Third", Author = "Author", UserId = User1Id }
        };
        await _fixture.Context.Quotes.AddRangeAsync(quotes);
        await _fixture.Context.SaveChangesAsync();
        _repository = new QuoteRepository(_fixture.Context);
        var request = new QuoteQueryRequest();

        var (items, _) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Select(q => q.Text).Should().Equal("Third", "Second", "First");
    }

    [Fact]
    public async Task GetAllByIdAsync_WithPagination_SkipsAndTakesCorrectly()
    {
        var quotes = Enumerable.Range(1, 25)
            .Select(i => new Quote 
            { 
                Text = $"Quote {i}", 
                Author = "Author", 
                UserId = User1Id 
            })
            .ToList();
        await _fixture.Context.Quotes.AddRangeAsync(quotes);
        await _fixture.Context.SaveChangesAsync();
        _repository = new QuoteRepository(_fixture.Context);
        var request = new QuoteQueryRequest { PageNumber = 3, PageSize = 5 };

        var (items, totalCount) = await _repository.GetAllByIdAsync(User1Id, request);

        totalCount.Should().Be(25);
        items.Should().HaveCount(5);
    }

    [Fact]
    public async Task GetByIdAsync_WhenQuoteExistsAndUserIdMatches_ReturnsQuote()
    {
        var quote = new Quote { Text = "Quote text", Author = "Author", UserId = User1Id };
        await _fixture.Context.Quotes.AddAsync(quote);
        await _fixture.Context.SaveChangesAsync();
        _repository = new QuoteRepository(_fixture.Context);

        var result = await _repository.GetByIdAsync(quote.Id, User1Id);

        result.Should().NotBeNull();
        result!.Id.Should().Be(quote.Id);
        result.Text.Should().Be("Quote text");
    }

    [Fact]
    public async Task GetByIdAsync_WhenUserIdDoesNotMatch_ReturnsNull()
    {
        var quote = new Quote { Text = "Quote", Author = "Author", UserId = User1Id };
        await _fixture.Context.Quotes.AddAsync(quote);
        await _fixture.Context.SaveChangesAsync();
        _repository = new QuoteRepository(_fixture.Context);

        var result = await _repository.GetByIdAsync(quote.Id, User2Id);

        result.Should().BeNull();
    }

    [Fact]
    public async Task Remove_WhenCalled_RemovesQuoteFromContext()
    {
        var quote = new Quote { Text = "Quote", Author = "Author", UserId = User1Id };
        await _fixture.Context.Quotes.AddAsync(quote);
        await _fixture.Context.SaveChangesAsync();
        _repository = new QuoteRepository(_fixture.Context);

        _repository.Remove(quote);
        await _repository.SaveChangesAsync();

        var deletedQuote = await _fixture.Context.Quotes.FirstOrDefaultAsync(q => q.Id == quote.Id);
        deletedQuote.Should().BeNull();
    }
}
