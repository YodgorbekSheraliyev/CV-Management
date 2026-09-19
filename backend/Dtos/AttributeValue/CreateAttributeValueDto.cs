using backend.enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.AttributeValue
{
    public class CreateAttributeValueDto
    {
        [Required(ErrorMessage = "AttributeIdRequired")]
        public int AttributeId { get; set; }
        public string? Value { get; set; }
        public string? PeriodEnd { get; set; }
    }
}