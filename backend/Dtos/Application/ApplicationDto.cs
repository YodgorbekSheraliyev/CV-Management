namespace backend.Dtos.Application
{
    public class ApplicationDto
    {
        public int CvId { get; set; }
        public int CandidateId { get; set; }
        public string CandidateName { get; set; }
        public int? PositionId { get; set; }
        public string PositionTitle { get; set; }
        public string? Level { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
