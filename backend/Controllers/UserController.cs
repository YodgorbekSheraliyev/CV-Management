using backend.Dtos;
using backend.Dtos.User;
using backend.Exceptions;
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

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{userId:int}")]
        [Authorize(Roles = "Candidate,Administrator")]
        public async Task<IActionResult> GetUserProfile(int userId)
        {
            var user = await _userService.GetUserById(userId);
            return Ok(CommonResponse<UserDto>.Ok(user));
        }

        [HttpPut("{userId:int}")]
        public async Task<IActionResult> UpdateUserProfile(int userId, [FromBody] UpdateUserDto updateUserDto)
        {
            var user = await _userService.Update(userId, updateUserDto);
            return Ok(CommonResponse<UserDto>.Ok(user));
        }
    }
}
