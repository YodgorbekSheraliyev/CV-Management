using backend.Dtos;
using backend.Dtos.AttributeValue;
using backend.Extensions;
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
    public class AttributeValueController : ControllerBase
    {
        private readonly IStringLocalizer<SharedResource> _localizer;
        private readonly AttributeValueService _attributeValueService;

        public AttributeValueController(AttributeValueService attributeValueService, IStringLocalizer<SharedResource> localizer)
        {
            _attributeValueService = attributeValueService;
            _localizer = localizer;
        }
        public int CurrentUserId => User.GetUserId(_localizer);

        [HttpGet]
        public async Task<IActionResult> GetAllForUserId()
        {
            var result = await _attributeValueService.GetAllForUserId(CurrentUserId);
            return Ok(CommonResponse<List<AttributeValueDto>>.Ok(result));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAttributeValueDto createAttributeValueDto)
        {
            var result = await _attributeValueService.Create(createAttributeValueDto, CurrentUserId);
            return Ok(CommonResponse<AttributeValueDto>.Ok(result));
        }

        [HttpPost("image/{attributeId}")]
        public async Task<IActionResult> UploadUserImage([FromForm] IFormFile image, int attributeId)
        {
            var imageUrl = await _attributeValueService.UploadUserImage(CurrentUserId, image, attributeId);
            return Ok(CommonResponse<string>.Ok(imageUrl));
        }

        [HttpPut]
        public async Task<IActionResult> Update(UpdateAttributeValueDto updateAttributeValueDto)
        {
            var result = await _attributeValueService.Update(updateAttributeValueDto, CurrentUserId);
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

