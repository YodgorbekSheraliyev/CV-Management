namespace backend.Models
{
    public class CV
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? PositionId { get; set; }
        public List<Like> Likes  { get; set; }
        public Position? Position { get; set; }
        public User User { get; set; }

    }
}
