using backend.Dtos;
using backend.Localization;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AttributeController : ControllerBase
    {
        private readonly AttributeService _attributeService;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public AttributeController(AttributeService attributeService, IStringLocalizer<SharedResource> localizer)
        {
            _attributeService = attributeService;
            _localizer = localizer;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllAttributes()
        {
            try
            {
                var result = await _attributeService.GetAllAttributes();
                return Ok(CommonResponse<List<AttributeDto>>.Ok(result));

            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _localizer["InternalServerError"])
            }
        }
    }
}
