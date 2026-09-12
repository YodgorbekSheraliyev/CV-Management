using backend.Dtos;
using backend.Dtos.Position;
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
    public class PositionsController : ControllerBase
    {
        private readonly PositionService _positionService;

        public PositionsController(PositionService positionService)
        {
            _positionService = positionService;
        }

        [HttpGet("all")]
        [Authorize(Roles = "Recruiter,Administrator,Candidate")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _positionService.GetAll();
            return Ok(CommonResponse<List<PositionSummaryDto>>.Ok(result));
        }

        [HttpGet("{positionId:int}/{userId:int}")]
        [Authorize(Roles = "Recruiter,Administrator,Candidate")]
        public async Task<IActionResult> GetById(int positionId, int userId)
        {
            var result = await _positionService.GetById(positionId, userId);
            return Ok(CommonResponse<PositionDto>.Ok(result));
        }

        [Authorize(Roles = "Recruiter,Administrator")]
        [HttpPost("{userId:int}")]
        public async Task<IActionResult> Create(CreatePositionDto dto, int userId)
        {
            var result = await _positionService.Create(dto, userId);
            return CreatedAtAction(nameof(GetById), new { PositionId = result.Id, UserId = userId }, CommonResponse<PositionDto>.Ok(result));
        }

        [Authorize(Roles = "Recruiter,Administrator")]
        [HttpPut("{userId:int}")]
        public async Task<IActionResult> Update(UpdatePositionDto dto, int userId)
        {
            var result = await _positionService.Update(dto, userId);
            return Ok(CommonResponse<PositionDto>.Ok(result));
        }

        [Authorize(Roles = "Recruiter,Administrator")]
        [HttpDelete]
        public async Task<IActionResult> Delete(DeletePositionDto dto)
        {
            await _positionService.Delete(dto);
            return NoContent();
        }
        [Authorize(Roles = "Recruiter,Administrator")]
        [HttpPost("{positionId}/duplicate/{userId}")]
        public async Task<IActionResult> Duplicate(int positionId, int userId)
        {
            var result = await _positionService.Duplicate(positionId, userId);
            return Ok(CommonResponse<PositionDto>.Ok(result));
        }


        [HttpPost("{positionId:int}/apply")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Apply(int positionId)
        {
            var result = await _positionService.Apply(positionId, 1);
            return Ok(CommonResponse<object>.Ok(result));
        }
    }
}