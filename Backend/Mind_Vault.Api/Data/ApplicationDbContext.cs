using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Mind_Vault.Api.Models;

namespace Mind_Vault.Api.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
           : base(options) {}
        
        public DbSet<Book> Books { get; set; }
        public DbSet<Quote> Quotes { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Book>()
                .HasOne(book => book.User)
                .WithMany(user => user.Books)
                .HasForeignKey(book => book.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Book>()
                .HasIndex(book => book.UserId);

            builder.Entity<Quote>()
                .HasOne(quote => quote.User)
                .WithMany(user => user.Quotes)
                .HasForeignKey(quote => quote.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Quote>()
                .HasIndex(quote => quote.UserId);
        }
    }
}