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
    }
}
