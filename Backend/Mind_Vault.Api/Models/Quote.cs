namespace Mind_Vault.Api.Models
{
    public class Quote
    {
        public int Id { get; set; }
        public string Text { get; set; } = null!;
        public string Author { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }    
}

