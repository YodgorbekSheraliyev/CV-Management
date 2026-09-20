namespace backend.Dtos.Tag
{
    using System.ComponentModel.DataAnnotations;

    public class TagDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class CreateTagDto
    {
        [Required(ErrorMessage = "TagNameRequired")]
        public string Name { get; set; }
    }

    public class UpdateTagDto
    {
        [Required(ErrorMessage = "IdRequired")]
        public int Id { get; set; }
        [Required(ErrorMessage = "TagNameRequired")]
        public string Name { get; set; }
    }
    public class DeleteTagDto
    {
        [Required(ErrorMessage = "IdRequired")]
        public int Id { get; set; }
    }
}
