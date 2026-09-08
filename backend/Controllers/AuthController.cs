using backend.Dtos;
using backend.Dtos.Auth;
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
            var token = await _authService.Login(loginDto);
            return Ok(CommonResponse<string>.Ok(token));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            var token = await _authService.Register(registerDto);
            return Ok(CommonResponse<string>.Ok(token));
        }
    }
}
