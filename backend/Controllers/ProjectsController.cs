using backend.Dtos;
using backend.Dtos.Project;
using backend.Exceptions;
using backend.Localization;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly ProjectService _projectService;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public ProjectsController(ProjectService projectService, IStringLocalizer<SharedResource> localizer)
        {
            _projectService = projectService;
            _localizer = localizer;
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetAll(int userId)
        {
            var result = await _projectService.GetAll(userId);
            return Ok(CommonResponse<List<ProjectDto>>.Ok(result));
        }
        [HttpGet("{userId:int}/{projectId:int}")]
        public async Task<IActionResult> GetOne(int userId, int projectId)
        {
            try
            {
                var result = await _projectService.GetOne(userId, projectId);
                return Ok(CommonResponse<ProjectDto>.Ok(result));
            }
            catch (NotFoundException e)
            {
                return NotFound(CommonResponse<ProjectDto>.Fail(e.Message));
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, CommonResponse<string>.Fail(_localizer["InternalServerError"]));
            }
        }
        [HttpPost]
        public async Task<IActionResult> Create(CreateProjectDto dto)
        {
            try
            {
                var result = await _projectService.Create(dto);
                return Ok(CommonResponse<ProjectDto>.Ok(result));
            }
            catch (InvalidDataException e)
            {
                return BadRequest(CommonResponse<ProjectDto>.Fail(e.Message));
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, CommonResponse<string>.Fail(_localizer["InternalServerError"]));
            }
        }
        [HttpPut]
        public async Task<IActionResult> Update(UpdateProjectDto dto)
        {
            var result = await _projectService.Update(dto);
            return Ok(CommonResponse<ProjectDto>.Ok(result));
        }
        [HttpDelete]
        public async Task<IActionResult> Delete(DeleteProjectDto dto)
        {
            await _projectService.Delete(dto);
            return NoContent();
        }
    }
}