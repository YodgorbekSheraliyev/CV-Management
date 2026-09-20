using backend.Dtos;
using backend.Dtos.Position;
using backend.Exceptions;
using backend.Extensions;
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
    public class PositionsController : ControllerBase
    {
        private readonly PositionService _positionService;
        private readonly IStringLocalizer<SharedResource> _localizer;
        private int CurrentUserId => User.GetUserId(_localizer);

        public PositionsController(PositionService positionService, IStringLocalizer<SharedResource> localizer)
        {
            _positionService = positionService;
            _localizer = localizer;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _positionService.GetAll();
            return Ok(CommonResponse<List<PositionSummaryDto>>.Ok(result));
        }

        [HttpGet("{positionId:int}")]
        [Authorize(Roles = "Recruiter,Administrator,Candidate")]
        public async Task<IActionResult> GetById(int positionId)
        {
            var result = await _positionService.GetById(positionId, CurrentUserId);
            return Ok(CommonResponse<PositionDto>.Ok(result));
        }

        [Authorize(Roles = "Recruiter,Administrator")]
        [HttpPost]
        public async Task<IActionResult> Create(CreatePositionDto dto)
        {
            var result = await _positionService.Create(dto, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { PositionId = result.Id, UserId = CurrentUserId }, CommonResponse<PositionDto>.Ok(result));
        }

        [Authorize(Roles = "Recruiter,Administrator")]
        [HttpPut]
        public async Task<IActionResult> Update(UpdatePositionDto dto)
        {
            var result = await _positionService.Update(dto, CurrentUserId);
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
        [HttpPost("{positionId}/duplicate")]
        public async Task<IActionResult> Duplicate(int positionId)
        {
            var result = await _positionService.Duplicate(positionId, CurrentUserId);
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