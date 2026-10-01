using backend.Dtos;
using backend.Dtos.SalesForce;
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
public class SalesForceController : ControllerBase
{
    private readonly SalesForceService _salesForceService;
    private readonly IStringLocalizer<SharedResource> _localizer;
    public SalesForceController(SalesForceService salesForceService, IStringLocalizer<SharedResource> localizer)
    {
        _salesForceService = salesForceService;
        _localizer = localizer;
    }

    [HttpPost("contact")]
    public async Task<IActionResult> CreateOrUpdateContact([FromBody] CreateSalesforceContactDto dto)
    {
        var userId = User.GetUserId(_localizer);
        var result = await _salesForceService.CreateOrUpdateContactAsync(userId,dto);
        return Ok(CommonResponse<SalesforceResultDto>.Ok(result));
    }
}