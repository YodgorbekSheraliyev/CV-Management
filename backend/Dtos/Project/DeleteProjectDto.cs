using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Project
{
    public class DeleteProjectDto
    {
        [Required(ErrorMessage = "ProjectIdRequired")]
        public int Id { get; set; }
    }
}
