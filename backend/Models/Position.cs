namespace backend.Models
{
    public class Position
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public List<Attribute> Attributes { get; set; }
        public List<PositionAccessRule> PositionAccessRules { get; set; }
        public List<Tag>? Tags { get; set; }
        public List<CV>? CVs { get; set; }
        public Discussion Discussion { get; set; }
        public bool IsPublic { get; set; } = true;
        public int MaxProjects { get; set; }

    }
}
