namespace backend.Models
{
    public class Tag
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public List<Position>? Positions { get; set; } = new();
        public List<Project>? Projects { get; set; }
    }
}