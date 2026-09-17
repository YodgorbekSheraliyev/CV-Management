using backend.enums;

namespace backend.Dtos.Auth
{
    public class GoogleAuthDto
    {
        public string IdToken { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Candidate;
    }
}
