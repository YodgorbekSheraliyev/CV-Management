using backend.Dtos;
using backend.Exceptions;
using backend.Localization;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace backend.Controllers
{
    //[Authorize]
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
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _attributeService.GetAll();
                return Ok(CommonResponse<List<AttributeDto>>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _localizer["InternalServerError"]);
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _attributeService.GetById(id);
                return Ok(CommonResponse<AttributeDto>.Ok(result));
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAttributeDto createAttributeDto)
        {
            try
            {
                var result = await _attributeService.Create(createAttributeDto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, CommonResponse<AttributeDto>.Ok(result));
            }
            catch (ConflictException e)
            {
                return BadRequest(CommonResponse<string>.Fail(e.Message));
            }
            catch (InvalidOperationException e)
            {
                return BadRequest(CommonResponse<string>.Fail(e.Message));
            }
            catch (Exception)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, CommonResponse<string>.Fail(_localizer["InternalServerError"]));
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAttributeDto updateAttributeDto)
        {
            try
            {
                var result = await _attributeService.Update(updateAttributeDto);
                return Ok(CommonResponse<AttributeDto>.Ok(result));
            }
            catch (UnauthorizedAccessException e)
            {
                return Unauthorized(CommonResponse<string>.Fail(e.Message));
            }
            catch (ConflictException e)
            {
                return BadRequest(CommonResponse<string>.Fail(e.Message));
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
        public async Task<IActionResult> Delete(DeleteAttributeDto deleteAttributeDto)
        {
            try
            {
                await _attributeService.Delete(deleteAttributeDto);
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
