using backend.enums;

namespace backend.Dtos
{
    public class AttributeDto
    {
        public int Id { get; init; }
        public string Name { get; init; }
        public AttributeCategory Category { get; init; }
        public AttributeType Type { get; init; }
        public string? Description { get; init; }
        public bool IsBuiltIn { get; init; }
    }
}
