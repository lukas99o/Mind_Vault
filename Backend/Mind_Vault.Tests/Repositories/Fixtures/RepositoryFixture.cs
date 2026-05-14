using Microsoft.EntityFrameworkCore;
using Mind_Vault.Api.Data;
using Mind_Vault.Api.Models;

namespace Mind_Vault.Tests.Repositories.Fixtures;

public sealed class RepositoryFixture
{
    private readonly ApplicationDbContext _context;

    public RepositoryFixture()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
    }

    public ApplicationDbContext Context => _context;

    public async Task InitializeAsync()
    {
        await _context.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
    }
}
