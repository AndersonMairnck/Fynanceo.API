// Controllers/AuthController.cs
using Fynanceo.API.Models.DTOs;
using Fynanceo.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Fynanceo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto userDto)
        {
            var result = await _authService.Register(userDto);

            if (result != "Usuário criado com sucesso")
                return BadRequest(new { message = result });

            return Ok(new { message = result });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto userDto)
        {
            var result = await _authService.Login(userDto);

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new
            {
                token = result.Token,
                user = result.User
            });
        }
    }
}