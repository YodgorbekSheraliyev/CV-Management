using backend.Dtos;
using backend.Dtos.Cv;
using backend.Extensions;
using backend.Localization;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CvsController : ControllerBase
    {
        private readonly CvService _cvService;
        private readonly IStringLocalizer<SharedResource> _localizer;
        private int CurrentUserId => User.GetUserId(_localizer);

        public CvsController(CvService cvService, IStringLocalizer<SharedResource> localizer)
        {
            _cvService = cvService;
            _localizer = localizer;
        }

        [HttpGet("all")]
        [Authorize(Roles = "Recruiter,Administrator")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _cvService.GetAll();
            return Ok(CommonResponse<List<CvSummaryDto>>.Ok(result));
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetAllForCurrentUser()
        {
            var result = await _cvService.GetAllForUserId(CurrentUserId);
            return Ok(CommonResponse<List<CvSummaryDto>>.Ok(result));
        }

        [HttpPost]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Create(CreateCvDto dto)
        {
            var result = await _cvService.Create(dto, CurrentUserId);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpGet("{cvId}")]
        public async Task<IActionResult> GetById(int cvId)
        {
            var result = await _cvService.GetById(cvId, CurrentUserId);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpPost("like/{cvId}")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> Like(int cvId)
        {
            var result = await _cvService.Like(cvId, CurrentUserId);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpDelete("unlike/{cvId}")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> Unlike(int cvId)
        {
            var result = await _cvService.Unlike(cvId, CurrentUserId);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpPut("attribute-values")]
        [Authorize(Roles = "Candidate,Administrator")]
        public async Task<IActionResult> UpdateAttributeValue(UpdateCvAttributeValueDto dto)
        {
            var result = await _cvService.UpdateAttributeValue(dto, CurrentUserId);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpPut("publish")]
        [Authorize(Roles = "Candidate,Administrator")]
        public async Task<IActionResult> Publish(PublishCvDto dto)
        {
            var result = await _cvService.Publish(dto, CurrentUserId);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpDelete]
        [Authorize(Roles = "Candidate,Administrator")]
        public async Task<IActionResult> Delete(DeleteCvDto dto)
        {
            await _cvService.Delete(dto, CurrentUserId);
            return NoContent();
        }

        [HttpGet("/api/positions/{positionId}/cvs")]
        [Authorize(Roles = "Recruiter,Administrator")]
        public async Task<IActionResult> GetByPositionId(int positionId)
        {
            var result = await _cvService.GetByPositionId(positionId);
            return Ok(CommonResponse<List<CvSummaryDto>>.Ok(result));
        }
    }
}