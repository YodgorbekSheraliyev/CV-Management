using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Position
{
    public class DeletePositionDto
    {
        [Required(ErrorMessage = "IdRequired")]
        public int Id { get; set; }
    }
}
