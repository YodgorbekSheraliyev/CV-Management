using backend.Dtos;
using backend.Dtos.AttributeValue;
using backend.Exceptions;
using backend.Localization;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace backend.Controllers
{
    //[Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AttributeValueController : ControllerBase
    {
        private readonly AttributeValueService _attributeValueService;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public AttributeValueController(AttributeValueService attributeValueService, IStringLocalizer<SharedResource> localizer)
        {
            _attributeValueService = attributeValueService;
            _localizer = localizer;
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetAllForUserId(int userId)
        {
            var result = await _attributeValueService.GetAllForUserId(userId);
            return Ok(CommonResponse<List<AttributeValueDto>>.Ok(result));

        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAttributeValueDto createAttributeValueDto)
        {
            var result = await _attributeValueService.Create(createAttributeValueDto);
            return Ok(CommonResponse<AttributeValueDto>.Ok(result));

        }

        [HttpPut]
        public async Task<IActionResult> Update(UpdateAttributeValueDto updateAttributeValueDto)
        {
            var result = await _attributeValueService.Update(updateAttributeValueDto);
            return Ok(CommonResponse<AttributeValueDto>.Ok(result));

        }

        [HttpDelete]
        public async Task<IActionResult> Delete(DeleteAttributeValueDto deleteAttributeValueDto)
        {
            var result = await _attributeValueService.Delete(deleteAttributeValueDto);
            return NoContent();

        }
    }
}

