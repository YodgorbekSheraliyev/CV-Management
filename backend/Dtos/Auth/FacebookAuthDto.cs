using backend.enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Dtos.Auth
{
    public class FacebookAuthDto
    {
        [Required(ErrorMessage = "FacebookAccessTokenRequired")]
        public string AccessToken { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Candidate;
    }
}
