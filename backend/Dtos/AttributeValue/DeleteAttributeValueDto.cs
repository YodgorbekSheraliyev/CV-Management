using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.AttributeValue
{
    public class DeleteAttributeValueDto
    {
        [Required(ErrorMessage = "IdRequired")]
        public int Id { get; set; }
    }
}