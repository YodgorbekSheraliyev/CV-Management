namespace backend.Dtos.Ticket
{
    public class CreateSupportTicketDto
    {
        public string Summary { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
    }

    public class SupportTicketJson
    {
        public string ReportedBy { get; set; } = string.Empty;
        public string? Position { get; set; }
        public string Link { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public List<string> AdminEmails { get; set; } = [];
    }
}
