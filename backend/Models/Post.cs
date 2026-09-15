namespace backend.Models
{
    public class Post: ModelBase
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; }
        public string Content { get; set; }
        public int PositionId { get; set; }
    }
}
