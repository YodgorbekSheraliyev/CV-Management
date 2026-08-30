using backend.Dtos;
using backend.Localization;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly IStringLocalizer<SharedResource> _localizer;
        public AuthController(AuthService authService, IStringLocalizer<SharedResource> localizer)
        {
            _authService = authService;
            _localizer = localizer;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            try
            {
                var token = await _authService.Login(loginDto);
                return Ok(CommonResponse<string>.Ok(token));
            }
            catch (InvalidDataException e)
            {
                return BadRequest(CommonResponse<string>.Fail(e.Message));
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    CommonResponse<string>.Fail(_localizer["InternalServerError"]));
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            try
            {
                var token = await _authService.Register(registerDto);
                return Ok(CommonResponse<string>.Ok(token));

            }
            catch (InvalidOperationException e)
            {
                return BadRequest(CommonResponse<string>.Fail(e.Message));
            }
            catch (Exception)
            {

                return StatusCode(StatusCodes.Status500InternalServerError,
                    CommonResponse<string>.Fail(_localizer["InternalServerError"]));
            }
        }
    }
}
