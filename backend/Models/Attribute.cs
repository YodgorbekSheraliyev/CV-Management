using backend.enums;

namespace backend.Models
{
    public class Attribute
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public AttributeType AttributeType{ get; set; }
        public AttributeCategory Category { get; set; }
        public string? Description { get; set; }
        public bool IsBuiltIn { get; set; } = false;

    }
}
