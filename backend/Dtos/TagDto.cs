namespace backend.Dtos
{
    public class TagDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class CreateTagDto
    {
        public string Name { get; set; }
    }

    public class UpdateTagDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
    public class DeleteTagDto
    {
        public int Id { get; set; }
    }
}
