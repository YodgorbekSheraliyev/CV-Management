using backend.enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "FirstNameRequired")]
        public string FirstName { get; set; }
        [Required(ErrorMessage = "LastNameRequired")]
        public string LastName { get; set; }
        [Required(ErrorMessage = "EmailRequired")]
        [EmailAddress(ErrorMessage = "InvalidEmail")]
        public string Email { get; set; }
        [Required(ErrorMessage = "PasswordRequired")]
        public string Password { get; set; }
    }
}
