namespace backend.Models
{
    public class Post
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public int DiscussionId { get; set; }
        public Discussion Discussion { get; set; }
    }
}
