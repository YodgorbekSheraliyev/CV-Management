using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Attribute
{
    public class DeleteAttributeDto
    {
        [Required(ErrorMessage = "IdRequired")]
        public int Id { get; set; }
    }
}
