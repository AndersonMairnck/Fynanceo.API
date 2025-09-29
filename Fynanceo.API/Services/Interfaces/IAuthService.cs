// Services/Interfaces/IAuthService.cs
using Fynanceo.API.Models.DTOs;

namespace Fynanceo.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<string> Register(UserRegisterDto userDto);
        Task<LoginResponseDto> Login(UserLoginDto userDto);
        bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt);
        void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt);
    }
}