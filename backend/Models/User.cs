using backend.enums;

namespace backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public UserRole Role { get; set; }
        public List<AttributeValue> AttributeValues { get; set; }
        public List<Project>? Projects { get; set; }
        public List<CV>? CVs { get; set; }
        public List<Like>? Likes { get; set; }
    }
}
