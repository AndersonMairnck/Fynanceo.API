// Models/DTOs/UserRegisterDto.cs
namespace Fynanceo.API.Models.DTOs
{
    public class UserRegisterDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } = "Funcionario";
    }
}