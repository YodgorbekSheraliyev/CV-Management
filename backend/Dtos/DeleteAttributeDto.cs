using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class DeleteAttributeDto
    {
        [Required(ErrorMessage = "IdRequired")]
        public int Id { get; set; }
    }
}
