namespace backend.Models
{
    public class Discussion
    {
        public int Id { get; set; }
        public int PositionId { get; set; }
        public List<Post> Posts { get; set; }
        public Position Position { get; set; }
    }
}