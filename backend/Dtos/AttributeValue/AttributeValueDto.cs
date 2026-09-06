using backend.Dtos.Attribute;

namespace backend.Dtos.AttributeValue
{
    public class AttributeValueDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int AttributeId { get; set; }
        public string Value { get; set; }
        public AttributeDto Attribute { get; set; }
    }
}
