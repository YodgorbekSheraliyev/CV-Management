using backend.Data;
using backend.Dtos.Ticket;
using backend.Exceptions;
using backend.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using System.Text.Json;

namespace backend.Services;

public class SupportTicketService
{
    private readonly DataContext _context;
    private readonly DropboxService _dropboxService;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public SupportTicketService(
        DataContext context,
        DropboxService dropboxService,
        IStringLocalizer<SharedResource> localizer)
    {
        _context = context;
        _dropboxService = dropboxService;
        _localizer = localizer;
    }

    public async Task CreateTicketAsync(
        int userId,
        CreateSupportTicketDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Summary))
            throw new BadRequestException(_localizer["SupportTicketSummaryRequired"]);

        if (dto.Priority is not ("High" or "Average" or "Low"))
            throw new BadRequestException(_localizer["SupportTicketInvalidPriority"]);

        if (string.IsNullOrWhiteSpace(dto.Link))
            throw new BadRequestException(_localizer["SupportTicketLinkRequired"]);

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
            throw new NotFoundException(_localizer["UserNotFound"]);

        var position = await GetPositionFromLinkAsync(dto.Link);

        var ticket = new SupportTicketJson
        {
            ReportedBy = $"{user.Email} ({user.Role})",
            Position = position?.Title,
            Link = dto.Link,
            Summary = dto.Summary,
            Priority = dto.Priority,
            AdminEmails = await GetAdminEmailsAsync()
        };

        var json = JsonSerializer.Serialize(
            ticket,
            new JsonSerializerOptions
            {
                WriteIndented = true
            });

        var fileName =
            $"support-ticket-{DateTime.UtcNow:yyyyMMdd-HHmmss}-{Guid.NewGuid():N}.json";

        await _dropboxService.UploadJsonAsync(fileName, json);
    }

    private async Task<Models.Position?> GetPositionFromLinkAsync(string link)
    {
        if (!Uri.TryCreate(link, UriKind.Absolute, out var uri))
            return null;

        var segments = uri.AbsolutePath
            .Split('/', StringSplitOptions.RemoveEmptyEntries);

        var positionIndex = Array.FindIndex(
            segments,
            x => x.Equals("positions", StringComparison.OrdinalIgnoreCase));

        if (positionIndex < 0 || positionIndex + 1 >= segments.Length)
            return null;

        if (!int.TryParse(segments[positionIndex + 1], out var positionId))
            return null;

        return await _context.Positions
            .FirstOrDefaultAsync(x => x.Id == positionId);
    }

    private async Task<List<string>> GetAdminEmailsAsync()
    {
        return await _context.Users
            .Where(x => x.Role == enums.UserRole.Administrator)
            .Select(x => x.Email)
            .ToListAsync();
    }
}