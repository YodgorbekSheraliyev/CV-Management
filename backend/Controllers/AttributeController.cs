using backend.Dtos;
using backend.Dtos.Attribute;
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

        public AttributeController(AttributeService attributeService)
        {
            _attributeService = attributeService;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _attributeService.GetAll();
            return Ok(CommonResponse<List<AttributeDto>>.Ok(result));

        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _attributeService.GetById(id);
            return Ok(CommonResponse<AttributeDto>.Ok(result));

        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAttributeDto createAttributeDto)
        {
            var result = await _attributeService.Create(createAttributeDto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, CommonResponse<AttributeDto>.Ok(result));

        }

        [HttpPut]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAttributeDto updateAttributeDto)
        {
            var result = await _attributeService.Update(updateAttributeDto);
            return Ok(CommonResponse<AttributeDto>.Ok(result));
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(DeleteAttributeDto deleteAttributeDto)
        {
            await _attributeService.Delete(deleteAttributeDto);
            return NoContent();
        }
    }
}
