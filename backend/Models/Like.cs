namespace backend.Models
{
    public class Like
    {
        public int Id { get; set; }
        public int? RecruiterId { get; set; }
        public int CVId { get; set; }
        public User? Recruiter { get; set; }
        public CV CV { get; set; }
    }
}
