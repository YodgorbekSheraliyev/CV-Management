using backend.Dtos.Attribute;
using backend.Dtos.Project;
using backend.enums;

namespace backend.Dtos.Cv
{
    public class CreateCvDto
    {
        public int PositionId { get; init; }
        public int UserId { get; init; }
    }

    public class UpdateCvDto
    {
        public int Id { get; init; }
        public List<int> AttributeIds { get; init; } = new();
        public List<int> ProjectIds { get; init; } = new();
    }

    public class UpdateCvAttributeValueDto
    {
        public int CvId { get; init; }
        public int AttributeValueId { get; init; }
        public string? Value { get; init; }
    }

    public class DeleteCvDto
    {
        public int Id { get; init; }
        public int UserId { get; init; }
    }

    public class CvSummaryDto
    {
        public int Id { get; init; }
        public int PositionId { get; init; }
        public string PositionTitle { get; init; }
        public int LikeCount { get; init; }
        public CVStatus Status { get; init; }
        public DateTime CreatedAt { get; init; }
    }

    public class CvDto : CvSummaryDto
    {
        public List<CvAttributeDto> Attributes { get; init; } = new();
        public List<ProjectDto> Projects { get; init; } = new();
    }
    public class CvAttributeDto
    {
        public int AttributeId { get; init; }
        public AttributeDto Attribute { get; init; } = null!;
        public string? Value { get; init; }
        public bool IsEmpty { get; init; }
    }

    public class PublishCvDto
    {
        public int Id { get; init; }
        public int UserId { get; init; }
    }
}