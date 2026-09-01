using backend.enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class CreateAttributeDto
    {
        [Required(ErrorMessage = "AttributeNameRequired")]
        public string Name { get; init; }
        [Required(ErrorMessage = "AttributeCategoryRequired")]
        public AttributeCategory Category { get; init; }
        [Required(ErrorMessage = "AttributeTypeRequired")]
        public AttributeType Type { get; init; }
        public string? Description { get; init; }
    }
}
