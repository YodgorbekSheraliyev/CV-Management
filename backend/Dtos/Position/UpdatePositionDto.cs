using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Position
{
    public class UpdatePositionDto : CreatePositionDto
    {
        [Required(ErrorMessage = "IdRequired")]
        public int Id { get; set; }
        [Required(ErrorMessage ="VersionRequired")]
        public int Version { get; set; }
    }
}
