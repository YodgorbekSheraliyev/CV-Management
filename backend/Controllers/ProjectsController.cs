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

        public ProjectsController(ProjectService projectService)
        {
            _projectService = projectService;
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
            var result = await _projectService.GetOne(userId, projectId);
            return Ok(CommonResponse<ProjectDto>.Ok(result));
        }
        [HttpPost]
        public async Task<IActionResult> Create(CreateProjectDto dto)
        {
            var result = await _projectService.Create(dto);
            return Ok(CommonResponse<ProjectDto>.Ok(result));
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