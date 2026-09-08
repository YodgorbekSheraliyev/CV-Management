using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Position
{
    public class UpdatePositionDto : CreatePositionDto
    {
        public int Id { get; set; }
    }
}
