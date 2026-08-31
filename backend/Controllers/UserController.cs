using backend.Dtos;
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
    public class UserController: ControllerBase
    {
        private UserService _userService;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public UserController(UserService userService, IStringLocalizer<SharedResource> localizer)
        {
            _userService = userService;
            _localizer = localizer;
        }

        [HttpGet("{userId:int}")]
        [Authorize(Roles = "Candidate,Administrator")]
        public async Task<IActionResult> GetUserProfile(int userId)
        {
            try
            {
                var user = await _userService.GetUserById(userId);
                return Ok(CommonResponse<UserDto>.Ok(user));
            }
            catch (NotFoundException e)
            {
                return NotFound(CommonResponse<string>.Fail(e.Message));
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, CommonResponse<string>.Fail(_localizer["InternalServerError"]));
            }
        }
    }
}
