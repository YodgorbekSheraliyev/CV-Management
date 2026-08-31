using backend.enums;
using backend.Models;

namespace backend.Dtos
{
    public class UserDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? Email { get; set; }
        public string Role { get; set; }
        public string? ImageUrl { get; set; }
    }
}
