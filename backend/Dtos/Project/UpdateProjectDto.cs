using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Project
{
    public class UpdateProjectDto
    {
        [Required(ErrorMessage = "ProjectIdRequired")]
        public int Id { get; set; }
        [Required(ErrorMessage = "UserIdRequired")]
        public int UserId { get; set; }
        [Required(ErrorMessage = "ProjectNameRequired")]
        public string Name { get; init; } = null!;
        [Required(ErrorMessage = "ProjectStartDateRequired")]
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
        public List<string> Tags { get; set; }
    }
}
