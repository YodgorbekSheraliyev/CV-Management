using backend.enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Auth
{
    public class GoogleAuthDto
    {
        [Required(ErrorMessage = "GoogleIDTokenRequired")]
        public string IdToken { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Candidate;
    }
}
