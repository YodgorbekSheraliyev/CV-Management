namespace backend.Dtos.User
{
    public class UpdateUserDto
    {
        public int Version { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Location { get; set; }
    }
}