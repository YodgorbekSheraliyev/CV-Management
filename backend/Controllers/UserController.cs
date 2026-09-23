using backend.Dtos;
using backend.Dtos.User;
using backend.Exceptions;
using backend.Extensions;
using backend.Localization;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private UserService _userService;
        private readonly IStringLocalizer<SharedResource> _localizer;
        private int CurrentUserId => User.GetUserId(_localizer);

        public UserController(UserService userService, IStringLocalizer<SharedResource> localizer)
        {
            _userService = userService;
            _localizer = localizer;
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetUserProfile(int userId)
        {
            if (CurrentUserId != userId && User.IsInRole("Candidate"))
            {
                throw new ForbiddenException(_localizer["ProfileAccessDenied"]);
            }
            var user = await _userService.GetUserById(userId);
            return Ok(CommonResponse<UserDto>.Ok(user));
        }

        [HttpPut]
        [Authorize(Roles = "Candidate,Administrator")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateUserDto updateUserDto)
        {
            var user = await _userService.Update(CurrentUserId, updateUserDto);
            return Ok(CommonResponse<UserDto>.Ok(user));
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var users = await _userService.GetAllForAdmin();
            return Ok(CommonResponse<List<AdminUserDto>>.Ok(users));
        }


        [HttpPut("admin/role")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> UpdateRole(UpdateUserRoleDto dto)
        {
            var result = await _userService.UpdateRole(dto);
            return Ok(CommonResponse<AdminUserDto>.Ok(result));
        }


        [HttpPut("admin/block")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> UpdateBlocked(UpdateUserBlockDto dto)
        {
            var result = await _userService.UpdateBlocked(dto);
            return Ok(CommonResponse<AdminUserDto>.Ok(result));
        }

        [HttpDelete("admin/{userId:int}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            await _userService.DeleteUser(userId);
            return NoContent();
        }
    }
}
