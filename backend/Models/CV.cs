using backend.enums;
using System.Net.NetworkInformation;

namespace backend.Models
{
    public class CV: ModelBase
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int PositionId { get; set; }
        public Position? Position { get; set; } = null!;
        public CVStatus Status { get; set; } = CVStatus.Draft;
        public int Version { get; set; } = 1;
        public List<int> AttributeIds { get; set; } = new();
        public List<int> ProjectIds { get; set; } = new();
        public List<Like> Likes { get; set; } = new();
    }
}
