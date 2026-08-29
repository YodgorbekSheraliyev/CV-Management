using backend.enums;

namespace backend.Models
{
    public class AttributeValue
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int AttributeId { get; set; }
        public string Value { get; set; }
        public Attribute Attribute { get; set; }

    }
}