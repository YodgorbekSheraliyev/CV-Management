namespace backend.Models
{
    public class PositionAccessRule
    {
        public int Id { get; set; }
        public int PositionId { get; set; }
        public int AttributeId { get; set; }
        public ComparisonType ComparisonType { get; set; }
        public  string Value { get; set; }
        public Attribute Attribute { get; set; }
    }

    public enum ComparisonType
    {
        LessThan,
        LessThanOrEqual,
        GreaterThan,
        GreaterThanOrEqual,
        Equal
    }
}
