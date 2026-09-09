using backend.Dtos.Attribute;
using backend.Models;

namespace backend.Dtos.Position
{
    public class PositionDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public List<AttributeDto> Attributes { get; set; }
        public List<PositionAccessRule> PositionAccessRules { get; set; }
        public List<TagDto>? Tags { get; set; }
        public List<CV>? CVs { get; set; }
        public Discussion Discussion { get; set; }
        public bool IsPublic { get; set; } = true;
        public int MaxProjects { get; set; }
    }
    public class PositionSummaryDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public bool IsPublic { get; set; }
        public int MaxProjects { get; set; }
        public List<string> Tags { get; set; }
        public int? CVsCount { get; set; }
    }
}
