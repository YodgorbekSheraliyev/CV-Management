using backend.enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class UpdateAttributeDto
    {
        [Required(ErrorMessage ="IdRequired")]
        public int Id { get; set; }
        [Required(ErrorMessage = "AttributeNameRequired")]
        public string Name { get; init; }

        [Required(ErrorMessage = "AttributeCategoryRequired")]
        public AttributeCategory Category { get; init; }
        [Required(ErrorMessage = "AttributeTypeRequired")]
        public AttributeType Type { get; set; }
        public string? Description { get; init; }
        public List<string>? Options { get; set; }
    }
}
