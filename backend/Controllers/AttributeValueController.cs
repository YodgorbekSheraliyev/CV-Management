using backend.Dtos;
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
            try
            {
                var result = await _attributeValueService.GetAllForUserId(userId);
                return Ok(CommonResponse<List<AttributeValueDto>>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, CommonResponse<string>.Fail(_localizer["InternalServerError"]));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAttributeValueDto createAttributeValueDto)
        {
            try
            {
                var result = await _attributeValueService.Create(createAttributeValueDto);
                return Ok(CommonResponse<AttributeValueDto>.Ok(result));
            }
            catch (NotFoundException e)
            {
                return NotFound(CommonResponse<string>.Fail(e.Message));
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, CommonResponse<string>.Fail(_localizer["InternalServerError"]));
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update(UpdateAttributeValueDto updateAttributeValueDto)
        {
            try
            {
                var result = await _attributeValueService.Update(updateAttributeValueDto);
                return Ok(CommonResponse<AttributeValueDto>.Ok(result));
            }
            catch (NotFoundException e)
            {
                return NotFound(CommonResponse<string>.Fail(e.Message));
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, CommonResponse<string>.Fail(_localizer["InternalServerError"]));
            }
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(DeleteAttributeValueDto deleteAttributeValueDto)
        {
            try
            {
                var result = await _attributeValueService.Delete(deleteAttributeValueDto);
                return NoContent();
            }
            catch (NotFoundException e)
            {
                return NotFound(CommonResponse<string>.Fail(e.Message));
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, CommonResponse<string>.Fail(_localizer["InternalServerError"]));
            }
        }
    }
}

