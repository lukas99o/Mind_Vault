namespace Mind_Vault.Api.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Text { get; set; } = null!;
        public string Author { get; set; } = null!;
        public DateTime PublicationDate { get; set; }
    }    
}