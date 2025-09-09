// Controllers/AuthTestController.cs
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Fynanceo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthTestController : ControllerBase
    {
        [HttpGet("verify-token")]
        public IActionResult VerifyToken()
        {
            // Verificar se usuário está autenticado
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized("Token inválido ou expirado");
            }

            // Extrair informações do token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new
            {
                Message = "Token válido!",
                UserId = userId,
                UserName = userName,
                Email = userEmail,
                Role = userRole,
                IsAuthenticated = User.Identity.IsAuthenticated
            });
        }
    }
}