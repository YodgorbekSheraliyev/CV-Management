namespace backend.Dtos.Project
{
    public class ProjectDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = null!;
        public DateTime StartDate { get; init; }
        public DateTime? EndDate { get; init; }
        public string? Description { get; init; }
        public List<string> Tags { get; init; }
    }
}
