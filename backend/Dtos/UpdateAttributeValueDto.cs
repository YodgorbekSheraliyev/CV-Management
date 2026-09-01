using backend.enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class UpdateAttributeValueDto
    {
        [Required(ErrorMessage = "IdRequired")]
        public int Id { get; set; }
        [Required(ErrorMessage = "UserIdRequired")]
        public int UserId { get; set; }
        [Required(ErrorMessage = "AttributeIdRequired")]
        public int AttributeId { get; set; }
        [Required(ErrorMessage = "ValueRequired")]
        public string Value { get; set; }
    }
}