using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class DeleteAttributeValueDto
    {
        [Required(ErrorMessage = "IdRequired")]
        public int Id { get; set; }
    }
}