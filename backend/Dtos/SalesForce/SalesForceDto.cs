namespace backend.Dtos.SalesForce
{
    public class CreateSalesforceContactDto
    {
        public string? Phone { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? GitHubUrl { get; set; }
        public string? Notes { get; set; }
    }

    public class SalesforceResultDto
    {
        public string ContactId { get; set; } = string.Empty;
    }

}
