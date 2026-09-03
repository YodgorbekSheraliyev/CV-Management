using backend.enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class CreateAttributeValueDto
    {
        [Required(ErrorMessage = "UserIdRequired")]
        public int UserId { get; set; }
        [Required(ErrorMessage = "AttributeIdRequired")]
        public int AttributeId { get; set; }
        [Required(ErrorMessage = "ValueRequired")]
        public string Value { get; set; }
        public string? PeriodEnd { get; set; }
    }
}