using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Post
{
    public class PostDto
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; }
        public string Content { get; set; }
        public int PositionId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreatePostDto
    {
        [Required(ErrorMessage = "PostAuthorNameRequired")]
        public string AuthorName { get; set; }
        [Required(ErrorMessage = "PostContentRequired")]
        public string Content { get; set; }
        [Required(ErrorMessage = "PositionIdRequired")]
        public int PositionId { get; set; }
    }

}
