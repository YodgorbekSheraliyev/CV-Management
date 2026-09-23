namespace backend.Dtos
{
    public class DashboardDto
    {
        public List<DashboardPositionDto> LatestPositions { get; set; } = new();
        public List<DashboardPositionDto> PopularPositions { get; set; } = new();
        public List<DashboardTagDto> Tags { get; set; } = new();
        public DashboardStatsDto Statistics { get; set; } = new();
    }

    public class DashboardPositionDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public int CvCount { get; set; }
        public List<string> Tags { get; set; } = new();
    }

    public class DashboardTagDto
    {
        public string Name { get; set; } = string.Empty;
        public int UsageCount { get; set; }
    }

    public class DashboardStatsDto
    {
        public int NewCvsLast24Hours { get; set; }
        public int TotalPositions { get; set; }
        public int TotalCandidates { get; set; }
        public int TotalRecruiters { get; set; }
        public int TotalPublishedCvs { get; set; }
    }
}