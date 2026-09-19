using backend.enums;
using System.Text.Json.Serialization;

namespace backend.Dtos.Auth
{
    public class FacebookAuthDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Candidate;
    }
}
