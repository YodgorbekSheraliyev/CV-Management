using backend.Dtos;
using backend.Dtos.Ticket;
using backend.Extensions;
using backend.Localization;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupportTicketsController : ControllerBase
{
    private readonly SupportTicketService _supportTicketService;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public SupportTicketsController(SupportTicketService supportTicketService, IStringLocalizer<SharedResource> localizer)
    {
        _supportTicketService = supportTicketService;
        _localizer = localizer;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSupportTicketDto dto)
    {
        var userId = User.GetUserId(_localizer);
        await _supportTicketService.CreateTicketAsync(userId, dto);
        return Ok(CommonResponse<string>.Ok(_localizer["SupportTicketCreatedSuccessfully"]));
    }
}