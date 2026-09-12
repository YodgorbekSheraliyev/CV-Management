using backend.Dtos;
using backend.Dtos.Cv;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CvsController : ControllerBase
    {
        private readonly CvService _cvService;

        public CvsController(CvService cvService)
        {
            _cvService = cvService;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _cvService.GetAll();
            return Ok(CommonResponse<List<CvSummaryDto>>.Ok(result));
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetAllForUserId(int userId)
        {
            var result = await _cvService.GetAllForUserId(userId);
            return Ok(CommonResponse<List<CvSummaryDto>>.Ok(result));
        }

        [HttpPost]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Create(CreateCvDto dto)
        {
            var result = await _cvService.Create(dto);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpGet("{cvId}/{userId}")]
        public async Task<IActionResult> GetById(int cvId, int userId)
        {
            var result = await _cvService.GetById(cvId, userId);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpPut("attribute-values/{userId}")]
        [Authorize(Roles = "Candidate,Administrator")]
        public async Task<IActionResult> UpdateAttributeValue(UpdateCvAttributeValueDto dto, int userId)
        {
            var result = await _cvService.UpdateAttributeValue(dto, userId);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpPut("publish")]
        [Authorize(Roles = "Candidate,Administrator")]
        public async Task<IActionResult> Publish(PublishCvDto dto)
        {
            var result = await _cvService.Publish(dto);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(DeleteCvDto dto)
        {
            await _cvService.Delete(dto);
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