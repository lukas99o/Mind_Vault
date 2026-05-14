using FluentAssertions;
using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;
using Mind_Vault.Api.Repositories;
using Mind_Vault.Api.Services;
using Moq;

namespace Mind_Vault.Tests.Services;

public sealed class QuoteServiceTests
{
    private const string UserId = "user-123";
    private readonly Mock<IQuoteRepository> _quoteRepository = new();

    [Fact]
    public async Task GetAllAsync_WhenRepositoryReturnsItems_MapsItemsAndPaginationMetadata()
    {
        var request = new QuoteQueryRequest
        {
            PageNumber = 1,
            PageSize = 3
        };
        var items = new List<Quote>
        {
            new() { Id = 1, Text = "Quote 1", Author = "Author A", UserId = UserId },
            new() { Id = 2, Text = "Quote 2", Author = "Author B", UserId = UserId }
        };
        _quoteRepository
            .Setup(repository => repository.GetAllByIdAsync(UserId, request))
            .ReturnsAsync((items, 2));
        var service = CreateService();

        var response = await service.GetAllAsync(UserId, request);

        response.PageNumber.Should().Be(1);
        response.PageSize.Should().Be(3);
        response.TotalCount.Should().Be(2);
        response.TotalPages.Should().Be(1);
        response.Items.Should().BeEquivalentTo(
            new[]
            {
                new QuoteResponse(1, "Quote 1", "Author A"),
                new QuoteResponse(2, "Quote 2", "Author B")
            });
    }

    [Fact]
    public async Task CreateAsync_WhenCalled_PersistsQuoteWithUserIdAndReturnsMappedResponse()
    {
        var request = new QuoteCreateRequest
        {
            Text = "Stay hungry, stay foolish",
            Author = "Steve Jobs"
        };
        Quote? addedQuote = null;
        _quoteRepository
            .Setup(repository => repository.AddAsync(It.IsAny<Quote>()))
            .Callback<Quote>(quote =>
            {
                quote.Id = 21;
                addedQuote = quote;
            })
            .Returns(Task.CompletedTask);
        var service = CreateService();

        var response = await service.CreateAsync(UserId, request);

        addedQuote.Should().NotBeNull();
        addedQuote!.UserId.Should().Be(UserId);
        addedQuote.Text.Should().Be(request.Text);
        addedQuote.Author.Should().Be(request.Author);
        response.Should().Be(new QuoteResponse(21, request.Text, request.Author));
        _quoteRepository.Verify(repository => repository.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_WhenQuoteExists_ReturnsMappedResponse()
    {
        var quote = new Quote
        {
            Id = 8,
            Text = "Know thyself",
            Author = "Socrates",
            UserId = UserId
        };
        _quoteRepository
            .Setup(repository => repository.GetByIdAsync(quote.Id, UserId))
            .ReturnsAsync(quote);
        var service = CreateService();

        var response = await service.GetByIdAsync(quote.Id, UserId);

        response.Should().Be(new QuoteResponse(8, "Know thyself", "Socrates"));
    }

    [Fact]
    public async Task UpdateAsync_WhenQuoteDoesNotExist_ReturnsFalseWithoutSaving()
    {
        _quoteRepository
            .Setup(repository => repository.GetByIdAsync(34, UserId))
            .ReturnsAsync((Quote?)null);
        var service = CreateService();

        var updated = await service.UpdateAsync(34, UserId, new QuoteUpdateRequest());

        updated.Should().BeFalse();
        _quoteRepository.Verify(repository => repository.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_WhenQuoteExists_RemovesQuoteAndSavesChanges()
    {
        var quote = new Quote
        {
            Id = 5,
            Text = "Quote",
            Author = "Author",
            UserId = UserId
        };
        _quoteRepository
            .Setup(repository => repository.GetByIdAsync(quote.Id, UserId))
            .ReturnsAsync(quote);
        var service = CreateService();

        var deleted = await service.DeleteAsync(quote.Id, UserId);

        deleted.Should().BeTrue();
        _quoteRepository.Verify(repository => repository.Remove(quote), Times.Once);
        _quoteRepository.Verify(repository => repository.SaveChangesAsync(), Times.Once);
    }

    private QuoteService CreateService()
    {
        return new QuoteService(_quoteRepository.Object);
    }
}