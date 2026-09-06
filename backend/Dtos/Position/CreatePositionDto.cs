using backend.Dtos.Attribute;
using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Position
{
    //public record AccessRuleInputDto
    //{
    //    [Required]
    //    public int AttributeId { get; init; }
    //    [Required]
    //    public ComparisonType ComparisonType { get; init; }
    //    [Required]
    //    public string Value { get; init; } = null!;
    //}

    //public record CreatePositionDto
    //{
    //    [Required(ErrorMessage = "PositionTitleRequired")]
    //    public string Title { get; set; }

    //    [Required(ErrorMessage = "PositionDescriptionRequired")]
    //    public string Description { get; set; }

    //    public bool IsPublic { get; set; } = true;

    //    [Range(0, int.MaxValue, ErrorMessage = "MaxProjectsInvalid")]
    //    public int MaxProjects { get; set; }

    //    public List<int> AttributeIds { get; set; }
    //    public List<string> Tags { get; set; }
    //    public List<AccessRuleInputDto> AccessRules { get; set; }
    //}

    //public record PositionSummaryDto
    //{
    //    public int Id { get; init; }
    //    public string Title { get; init; } = null!;
    //    public string Description { get; init; } = null!;
    //    public bool IsPublic { get; init; }
    //    public int MaxProjects { get; init; }
    //    public List<string> Tags { get; init; } = new();
    //    public bool Accessible { get; init; } // computed per-viewer, Candidate only

    //    // Recruiter/Administrator only — service leaves this null for Candidates rather
    //    // than trusting the frontend to hide a real number.
    //    public int? CvCount { get; init; }
    //}

    //public record PositionDetailDto : PositionSummaryDto
    //{
    //    public List<AttributeDto> Attributes { get; init; } = new();
    //    public List<AccessRuleDetailDto> AccessRules { get; init; } = new();
    //}

    //public record AccessRuleDetailDto
    //{
    //    public int Id { get; init; }
    //    public AttributeDto Attribute { get; init; } = null!;
    //    public ComparisonType ComparisonType { get; init; }
    //    public string Value { get; init; } = null!;
    //}
    public class CreatePositionDto
    {
        [Required(ErrorMessage = "TitleRequired")]
        public string Title { get; set; }
        [Required(ErrorMessage = "DescriptionRequired")]
        public string Description { get; set; }
        public List<AttributeDto> Attributes { get; set; }
        public List<PositionAccessRule> PositionAccessRules { get; set; }
        public List<Tag>? Tags { get; set; }
        public List<CV>? CVs { get; set; }
        public Discussion Discussion { get; set; }
        public bool IsPublic { get; set; } = true;
        public int MaxProjects { get; set; }
    }
}