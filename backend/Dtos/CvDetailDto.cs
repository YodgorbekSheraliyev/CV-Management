using backend.Dtos.Attribute;
using backend.Dtos.Project;
using backend.enums;

namespace backend.Dtos.Cv
{
    public record CreateCvDto
    {
        public int PositionId { get; init; }
    }

    public record UpdateCvAttributeValueDto
    {
        public int CvId { get; init; }
        public int AttributeId { get; init; }
        public string Value { get; init; } = null!;
    }

    public record DeleteCvDto
    {
        public int Id { get; init; }
    }

    public record CvFieldDto
    {
        public AttributeDto Attribute { get; init; } = null!;
        public string? Value { get; init; }
        public bool IsEmpty { get; init; }
    }

    public record CvSummaryDto
    {
        public int Id { get; init; }
        public int PositionId { get; init; }
        public string PositionTitle { get; init; } = null!;
        public int LikeCount { get; init; }
        public CVStatus Status { get; init; }
    }

    public record CvDto : CvSummaryDto
    {
        public List<CvFieldDto> Fields { get; init; } = new();
        public List<ProjectDto> Projects { get; init; } = new();
    }
}