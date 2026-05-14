using FluentAssertions;
using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;
using Mind_Vault.Api.Repositories;
using Mind_Vault.Api.Services;
using Moq;

namespace Mind_Vault.Tests.Services;

public sealed class BookServiceTests
{
    private const string UserId = "user-123";
    private readonly Mock<IBookRepository> _bookRepository = new();

    [Fact]
    public async Task GetAllAsync_WhenRepositoryReturnsItems_MapsItemsAndPaginationMetadata()
    {
        var request = new BookQueryRequest
        {
            PageNumber = 2,
            PageSize = 2
        };
        var items = new List<Book>
        {
            new() { Id = 1, Text = "Text 1", Author = "Author A", PublicationDate = new DateTime(2024, 1, 2), UserId = UserId },
            new() { Id = 2, Text = "Text 2", Author = "Author B", PublicationDate = new DateTime(2024, 2, 3), UserId = UserId }
        };
        _bookRepository
            .Setup(repository => repository.GetAllByIdAsync(UserId, request))
            .ReturnsAsync((items, 5));
        var service = CreateService();

        var response = await service.GetAllAsync(UserId, request);

        response.PageNumber.Should().Be(2);
        response.PageSize.Should().Be(2);
        response.TotalCount.Should().Be(5);
        response.TotalPages.Should().Be(3);
        response.Items.Should().BeEquivalentTo(
            new[]
            {
                new BookResponse(1, "Text 1", "Author A", new DateTime(2024, 1, 2)),
                new BookResponse(2, "Text 2", "Author B", new DateTime(2024, 2, 3))
            });
    }

    [Fact]
    public async Task CreateAsync_WhenCalled_PersistsBookWithUserIdAndReturnsMappedResponse()
    {
        var request = new BookCreateRequest
        {
            Text = "Deep work",
            Author = "Cal Newport",
            PublicationDate = new DateTime(2016, 1, 5)
        };
        Book? addedBook = null;
        _bookRepository
            .Setup(repository => repository.AddAsync(It.IsAny<Book>()))
            .Callback<Book>(book =>
            {
                book.Id = 42;
                addedBook = book;
            })
            .Returns(Task.CompletedTask);
        var service = CreateService();

        var response = await service.CreateAsync(UserId, request);

        addedBook.Should().NotBeNull();
        addedBook!.UserId.Should().Be(UserId);
        addedBook.Text.Should().Be(request.Text);
        addedBook.Author.Should().Be(request.Author);
        addedBook.PublicationDate.Should().Be(request.PublicationDate);
        response.Should().Be(new BookResponse(42, request.Text, request.Author, request.PublicationDate));
        _bookRepository.Verify(repository => repository.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WhenBookExists_UpdatesFieldsAndSavesChanges()
    {
        var request = new BookUpdateRequest
        {
            Text = "Updated text",
            Author = "Updated author",
            PublicationDate = new DateTime(2025, 5, 1)
        };
        var book = new Book
        {
            Id = 7,
            Text = "Old text",
            Author = "Old author",
            PublicationDate = new DateTime(2020, 2, 2),
            UserId = UserId
        };
        _bookRepository
            .Setup(repository => repository.GetByIdAsync(book.Id, UserId))
            .ReturnsAsync(book);
        var service = CreateService();

        var updated = await service.UpdateAsync(book.Id, UserId, request);

        updated.Should().BeTrue();
        book.Text.Should().Be(request.Text);
        book.Author.Should().Be(request.Author);
        book.PublicationDate.Should().Be(request.PublicationDate);
        _bookRepository.Verify(repository => repository.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WhenBookDoesNotExist_ReturnsFalseWithoutSaving()
    {
        _bookRepository
            .Setup(repository => repository.GetByIdAsync(13, UserId))
            .ReturnsAsync((Book?)null);
        var service = CreateService();

        var updated = await service.UpdateAsync(13, UserId, new BookUpdateRequest());

        updated.Should().BeFalse();
        _bookRepository.Verify(repository => repository.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_WhenBookExists_RemovesBookAndSavesChanges()
    {
        var book = new Book
        {
            Id = 9,
            Text = "Text",
            Author = "Author",
            PublicationDate = new DateTime(2024, 3, 3),
            UserId = UserId
        };
        _bookRepository
            .Setup(repository => repository.GetByIdAsync(book.Id, UserId))
            .ReturnsAsync(book);
        var service = CreateService();

        var deleted = await service.DeleteAsync(book.Id, UserId);

        deleted.Should().BeTrue();
        _bookRepository.Verify(repository => repository.Remove(book), Times.Once);
        _bookRepository.Verify(repository => repository.SaveChangesAsync(), Times.Once);
    }

    private BookService CreateService()
    {
        return new BookService(_bookRepository.Object);
    }
}