using backend.Dtos.Attribute;
using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Position
{
    public class CreatePositionDto
    {
        [Required(ErrorMessage = "TitleRequired")]
        public string Title { get; set; }

        [Required(ErrorMessage = "DescriptionRequired")]
        public string Description { get; set; }

        public List<int> AttributeIds { get; set; } = new();
        public List<CreateAccessRuleDto> AccessRules { get; set; } = new();
        public List<int>? TagIds { get; set; }

        public bool IsPublic { get; set; } = true;
        public int MaxProjects { get; set; }
    }

    public class CreateAccessRuleDto
    {
        public int AttributeId { get; set; }
        public ComparisonType ComparisonType { get; set; }
        public string Value { get; set; }
    }
}