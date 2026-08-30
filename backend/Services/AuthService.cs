using backend.Data;
using backend.Dtos;
using backend.enums;
using backend.Localization;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Services
{
    public class AuthService
    {
        private readonly DataContext _db;
        private readonly IConfiguration _config;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public AuthService(DataContext db, IConfiguration config, IStringLocalizer<SharedResource> localizer)
        {
            _db = db;
            _config = config;
            _localizer = localizer;
        }

        public async Task<string> Register(RegisterDto registerDto)
        {
            if (await _db.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                throw new InvalidOperationException(_localizer["UserAlreadyExists"]);
            }

            var firstNameAttrib = await _db.Attributes.FirstOrDefaultAsync(x => x.Name == "First Name");
            var lastNameAttrib = await _db.Attributes.FirstOrDefaultAsync(x => x.Name == "Last Name");

            if (firstNameAttrib is null || lastNameAttrib is null)
            {
                throw new InvalidOperationException(_localizer["BuiltInAttributesNotFound"]);
            }

            User user = new User
            {
                Email = registerDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = UserRole.Candidate,
            };

            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();

            await _db.AttributeValues.AddRangeAsync(
                new AttributeValue { UserId = user.Id, AttributeId = firstNameAttrib.Id, Value = registerDto.FirstName },
                new AttributeValue { UserId = user.Id, AttributeId = lastNameAttrib.Id, Value = registerDto.LastName }
                );
            await _db.SaveChangesAsync();

            var token = GenerateToken(user);
            return token;
        }

        public async Task<string> Login(LoginDto loginDto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user is null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                throw new InvalidDataException(_localizer["EmailOrPasswordWrong"]);
            }
            return GenerateToken(user);
        }

        private string GenerateToken(User user)
        {
            var claims = new Claim[] {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                signingCredentials: creds,
                expires: DateTime.UtcNow.AddDays(int.Parse(_config["Jwt:ExpiresInDays"]!)));

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
