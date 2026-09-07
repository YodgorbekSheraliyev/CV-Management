using backend.Dtos;
using backend.Dtos.Cv;
using backend.Exceptions;
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

        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsRecruiterOrAdmin => User.IsInRole("Recruiter") || User.IsInRole("Administrator");
        private bool IsAdmin => User.IsInRole("Administrator");

        [HttpGet]
        public async Task<IActionResult> GetMine()
        {
            var result = await _cvService.GetMine(CurrentUserId);
            return Ok(CommonResponse<List<CvSummaryDto>>.Ok(result));
        }

        [HttpPost]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Create(CreateCvDto dto)
        {
            var result = await _cvService.Create(dto, CurrentUserId);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _cvService.GetById(id, CurrentUserId, IsRecruiterOrAdmin, IsAdmin);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpPut("attribute-values")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> UpdateAttributeValue(UpdateCvAttributeValueDto dto)
        {
            var result = await _cvService.UpdateAttributeValue(dto, CurrentUserId);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpPost("{id}/publish")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Publish(int id)
        {
            var result = await _cvService.Publish(id, CurrentUserId);
            return Ok(CommonResponse<CvDto>.Ok(result));
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(DeleteCvDto dto)
        {
            await _cvService.Delete(dto, CurrentUserId, IsAdmin);
            return NoContent();
        }

        [HttpGet("/api/positions/{positionId}/cvs")]
        [Authorize(Roles = "Recruiter,Administrator")]
        public async Task<IActionResult> GetByPosition(int positionId)
        {
            var result = await _cvService.GetByPosition(positionId);
            return Ok(CommonResponse<List<CvSummaryDto>>.Ok(result));
        }
    }
}