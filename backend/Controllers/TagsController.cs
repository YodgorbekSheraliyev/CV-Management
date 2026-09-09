using backend.Dtos;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TagsController : ControllerBase
    {
        private readonly TagService _tagService;
        public TagsController(TagService tagService)
        {
            _tagService = tagService;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllTags()
        {
            var tags = await _tagService.GetAllTags();
            return Ok(CommonResponse<List<TagDto>>.Ok(tags));
        }

        [HttpGet("{name:alpha}")]
        public async Task<IActionResult> GetByName(string name)
        {
            var result = await _tagService.GetTagByName(name);
            return Ok(CommonResponse<TagDto>.Ok(result));
        }
        [HttpPost]
        public async Task<IActionResult> CreateTag(CreateTagDto dto)
        {
            var result = await _tagService.CreateTag(dto);
            return CreatedAtAction(nameof(GetByName), new { name = result.Name }, CommonResponse<TagDto>.Ok(result));
        }
        [HttpPut]
        public async Task<IActionResult> UpdateTag(UpdateTagDto dto)
        {
            var result = await _tagService.UpdateTag(dto);
            return Ok(CommonResponse<TagDto>.Ok(result));
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteTag(DeleteTagDto dto)
        {
            await _tagService.DeleteTag(dto);
            return NoContent();
        }
    }
}
