using backend.enums;

namespace backend.Dtos.User
{
    public class AdminUserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsBlocked { get; set; }
        public int Version { get; set; }
    }

    public class UpdateUserRoleDto
    {
        public int UserId { get; set; }
        public UserRole Role { get; set; }
        public int Version { get; set; }
    }

    public class UpdateUserBlockDto
    {
        public int UserId { get; set; }
        public bool IsBlocked { get; set; }
        public int Version { get; set; }
    }
}