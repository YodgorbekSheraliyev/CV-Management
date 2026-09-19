using backend.Dtos;
using backend.Dtos.Application;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles ="Administrator,Recruiter")]
    public class ApplicationsController:ControllerBase
    {
        private readonly ApplicationService _applicationService;

        public ApplicationsController(ApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll([FromQuery] int pageNumber=1, [FromQuery] int pageSize = 10)
        {
            var result = await _applicationService.GetAll(pageNumber, pageSize);
            return Ok(CommonResponse<List<ApplicationDto>>.Ok(result));
        }
    }
}
