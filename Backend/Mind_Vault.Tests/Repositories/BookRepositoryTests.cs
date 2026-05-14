using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;
using Mind_Vault.Api.Repositories;
using Mind_Vault.Tests.Repositories.Fixtures;

namespace Mind_Vault.Tests.Repositories;

public sealed class BookRepositoryTests : IAsyncLifetime
{
    private const string User1Id = "user-1";
    private const string User2Id = "user-2";
    private readonly RepositoryFixture _fixture = new();
    private BookRepository _repository = null!;

    public Task InitializeAsync() => _fixture.InitializeAsync();
    public Task DisposeAsync() => _fixture.DisposeAsync();

    [Fact]
    public async Task GetAllByIdAsync_FiltersByUserId_ExcludesOtherUsersBooks()
    {
        var user1Books = new[]
        {
            new Book { Text = "Book 1", Author = "Author A", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Book 2", Author = "Author B", PublicationDate = new DateTime(2024, 2, 1), UserId = User1Id }
        };
        var user2Books = new[]
        {
            new Book { Text = "Book 3", Author = "Author C", PublicationDate = new DateTime(2024, 3, 1), UserId = User2Id }
        };
        await _fixture.Context.Books.AddRangeAsync(user1Books.Concat(user2Books));
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);
        var request = new BookQueryRequest();

        var (items, totalCount) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Should().HaveCount(2);
        totalCount.Should().Be(2);
        items.Should().AllSatisfy(book => book.UserId.Should().Be(User1Id));
    }

    [Fact]
    public async Task GetAllByIdAsync_FiltersByAuthor_ReturnsBooksContainingAuthorName()
    {
        var books = new[]
        {
            new Book { Text = "Text", Author = "Cal Newport", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Text", Author = "James Clear", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Text", Author = "Stephen King", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id }
        };
        await _fixture.Context.Books.AddRangeAsync(books);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);
        var request = new BookQueryRequest { Author = "Cal" };

        var (items, totalCount) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Should().HaveCount(1);
        totalCount.Should().Be(1);
        items.First().Author.Should().Be("Cal Newport");
    }

    [Fact]
    public async Task GetAllByIdAsync_FiltersBySearchText_ReturnsBooksContainingTextInContent()
    {
        var books = new[]
        {
            new Book { Text = "Deep work is essential", Author = "Author A", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Shallow work ruins productivity", Author = "Author B", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "No matching content here", Author = "Author C", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id }
        };
        await _fixture.Context.Books.AddRangeAsync(books);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);
        var request = new BookQueryRequest { SearchText = "work" };

        var (items, totalCount) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Should().HaveCount(2);
        totalCount.Should().Be(2);
        items.Should().AllSatisfy(book => book.Text.Should().Contain("work"));
    }

    [Fact]
    public async Task GetAllByIdAsync_FiltersByDateRange_ReturnsBooksWithinRange()
    {
        var books = new[]
        {
            new Book { Text = "Text", Author = "Author", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Text", Author = "Author", PublicationDate = new DateTime(2024, 6, 15), UserId = User1Id },
            new Book { Text = "Text", Author = "Author", PublicationDate = new DateTime(2024, 12, 31), UserId = User1Id }
        };
        await _fixture.Context.Books.AddRangeAsync(books);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);
        var request = new BookQueryRequest
        {
            PublicationDateFrom = new DateTime(2024, 6, 1),
            PublicationDateTo = new DateTime(2024, 12, 31)
        };

        var (items, totalCount) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Should().HaveCount(2);
        totalCount.Should().Be(2);
        foreach (var book in items)
        {
            book.PublicationDate.Should().BeOnOrAfter(new DateTime(2024, 6, 1));
            book.PublicationDate.Should().BeOnOrBefore(new DateTime(2024, 12, 31));
        }
    }

    [Fact]
    public async Task GetAllByIdAsync_SortByAuthorAscending_ReturnsSortedByAuthor()
    {
        var books = new[]
        {
            new Book { Text = "Text", Author = "Zebra", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Text", Author = "Apple", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Text", Author = "Mango", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id }
        };
        await _fixture.Context.Books.AddRangeAsync(books);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);
        var request = new BookQueryRequest { SortBy = "author", SortDescending = false };

        var (items, _) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Select(b => b.Author).Should().Equal("Apple", "Mango", "Zebra");
    }

    [Fact]
    public async Task GetAllByIdAsync_SortByAuthorDescending_ReturnsSortedByAuthorDesc()
    {
        var books = new[]
        {
            new Book { Text = "Text", Author = "Zebra", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Text", Author = "Apple", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Text", Author = "Mango", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id }
        };
        await _fixture.Context.Books.AddRangeAsync(books);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);
        var request = new BookQueryRequest { SortBy = "author", SortDescending = true };

        var (items, _) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Select(b => b.Author).Should().Equal("Zebra", "Mango", "Apple");
    }

    [Fact]
    public async Task GetAllByIdAsync_SortByTextAscending_ReturnsSortedByText()
    {
        var books = new[]
        {
            new Book { Text = "Zulu text", Author = "Author", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Alpha text", Author = "Author", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Mike text", Author = "Author", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id }
        };
        await _fixture.Context.Books.AddRangeAsync(books);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);
        var request = new BookQueryRequest { SortBy = "text", SortDescending = false };

        var (items, _) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Select(b => b.Text).Should().Equal("Alpha text", "Mike text", "Zulu text");
    }

    [Fact]
    public async Task GetAllByIdAsync_DefaultSortByPublicationDateDescending_ReturnsSortedByDateDesc()
    {
        var books = new[]
        {
            new Book { Text = "Text", Author = "Author", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id },
            new Book { Text = "Text", Author = "Author", PublicationDate = new DateTime(2024, 12, 31), UserId = User1Id },
            new Book { Text = "Text", Author = "Author", PublicationDate = new DateTime(2024, 6, 15), UserId = User1Id }
        };
        await _fixture.Context.Books.AddRangeAsync(books);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);
        var request = new BookQueryRequest();

        var (items, _) = await _repository.GetAllByIdAsync(User1Id, request);

        items.Select(b => b.PublicationDate).Should()
            .Equal(new DateTime(2024, 12, 31), new DateTime(2024, 6, 15), new DateTime(2024, 1, 1));
    }

    [Fact]
    public async Task GetAllByIdAsync_WithPagination_SkipsAndTakesCorrectly()
    {
        var books = Enumerable.Range(1, 25)
            .Select(i => new Book 
            { 
                Text = $"Book {i}", 
                Author = "Author", 
                PublicationDate = new DateTime(2024, 1, (i % 28) + 1), 
                UserId = User1Id 
            })
            .ToList();
        await _fixture.Context.Books.AddRangeAsync(books);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);
        var request = new BookQueryRequest { PageNumber = 2, PageSize = 10 };

        var (items, totalCount) = await _repository.GetAllByIdAsync(User1Id, request);

        totalCount.Should().Be(25);
        items.Should().HaveCount(10);
    }

    [Fact]
    public async Task GetAllByIdAsync_PageBeyondTotal_ReturnsEmpty()
    {
        var books = new[] { new Book { Text = "Text", Author = "Author", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id } };
        await _fixture.Context.Books.AddRangeAsync(books);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);
        var request = new BookQueryRequest { PageNumber = 10, PageSize = 10 };

        var (items, totalCount) = await _repository.GetAllByIdAsync(User1Id, request);

        totalCount.Should().Be(1);
        items.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByIdAsync_WhenBookExistsAndUserIdMatches_ReturnsBook()
    {
        var book = new Book { Text = "Text", Author = "Author", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id };
        await _fixture.Context.Books.AddAsync(book);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);

        var result = await _repository.GetByIdAsync(book.Id, User1Id);

        result.Should().NotBeNull();
        result!.Id.Should().Be(book.Id);
        result.Text.Should().Be(book.Text);
    }

    [Fact]
    public async Task GetByIdAsync_WhenUserIdDoesNotMatch_ReturnsNull()
    {
        var book = new Book { Text = "Text", Author = "Author", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id };
        await _fixture.Context.Books.AddAsync(book);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);

        var result = await _repository.GetByIdAsync(book.Id, User2Id);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WhenBookDoesNotExist_ReturnsNull()
    {
        _repository = new BookRepository(_fixture.Context);

        var result = await _repository.GetByIdAsync(999, User1Id);

        result.Should().BeNull();
    }

    [Fact]
    public async Task AddAsync_WhenCalled_AddsBookToContext()
    {
        _repository = new BookRepository(_fixture.Context);
        var book = new Book { Text = "Text", Author = "Author", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id };

        await _repository.AddAsync(book);
        await _repository.SaveChangesAsync();

        var savedBook = await _fixture.Context.Books.FirstOrDefaultAsync(b => b.Text == "Text");
        savedBook.Should().NotBeNull();
        savedBook!.Author.Should().Be("Author");
    }

    [Fact]
    public async Task Remove_WhenCalled_RemovesBookFromContext()
    {
        var book = new Book { Text = "Text", Author = "Author", PublicationDate = new DateTime(2024, 1, 1), UserId = User1Id };
        await _fixture.Context.Books.AddAsync(book);
        await _fixture.Context.SaveChangesAsync();
        _repository = new BookRepository(_fixture.Context);

        _repository.Remove(book);
        await _repository.SaveChangesAsync();

        var deletedBook = await _fixture.Context.Books.FirstOrDefaultAsync(b => b.Id == book.Id);
        deletedBook.Should().BeNull();
    }
}
