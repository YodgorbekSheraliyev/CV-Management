using backend.Data;
using backend.Dtos.Auth;
using backend.enums;
using backend.Exceptions;
using backend.Localization;
using backend.Models;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.SqlServer.Server;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

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
            if (registerDto.Role == UserRole.Administrator)
            {
                throw new ForbiddenException(_localizer["CannotRegisterAsAdministrator"]);
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
                Role = registerDto.Role,
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
            if (user is null || user.IsBlocked || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                throw new InvalidDataException(_localizer["EmailOrPasswordWrong"]);
            }
            return GenerateToken(user);
        }

        public async Task<string> GoogleAuthAsync(GoogleAuthDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.IdToken))
            {
                throw new ArgumentException(_localizer["GoogleIDTokenRequired"]);
            }

            var googleClientId = _config["Google:ClientId"];
            if (string.IsNullOrWhiteSpace(googleClientId))
            {
                throw new InvalidOperationException(_localizer["GoogleClientIdNotConfigured"]);
            }

            GoogleJsonWebSignature.Payload payload;

            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(
                    dto.IdToken,
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[]
                        {
                            googleClientId
                        }
                    });
            }
            catch (InvalidJwtException)
            {
                throw new UnauthorizedAccessException(_localizer["InvalidGoogleIDToken"]);
            }

            if (string.IsNullOrWhiteSpace(payload.Email))
            {
                throw new ForbiddenException(_localizer["GoogleAccountEmailNotProvided"]);
            }

            if (!payload.EmailVerified)
            {
                throw new ForbiddenException(_localizer["GoogleEmailNotVerified"]);
            }

            var email = payload.Email.Trim().ToLowerInvariant();

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user is null)
            {
                var firstNameAttrib = await _db.Attributes.FirstOrDefaultAsync(x => x.Name == "First Name");
                var lastNameAttrib = await _db.Attributes.FirstOrDefaultAsync(x => x.Name == "Last Name");
                if (firstNameAttrib is null || lastNameAttrib is null)
                {
                    throw new InvalidOperationException(_localizer["BuiltInAttributesNotFound"]);
                }

                if (dto.Role == UserRole.Administrator)
                {
                    throw new ForbiddenException(_localizer["CannotRegisterAsAdministrator"]);
                }
                user = new User
                {
                    Email = email,
                    Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    Role = dto.Role
                };

                await _db.Users.AddAsync(user);
                await _db.SaveChangesAsync();

                await _db.AttributeValues.AddRangeAsync(
                    new AttributeValue
                    {
                        UserId = user.Id,
                        AttributeId = firstNameAttrib.Id,
                        Value = payload.GivenName ?? string.Empty
                    },
                    new AttributeValue
                    {
                        UserId = user.Id,
                        AttributeId = lastNameAttrib.Id,
                        Value = payload.FamilyName ?? string.Empty
                    });

                await _db.SaveChangesAsync();
            }

            return GenerateToken(user);
        }
        
        public async Task<string> FacebookAuthAsync(FacebookAuthDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.AccessToken))
            {
                throw new UnauthorizedAccessException(_localizer["FacebookAccessTokenRequired"]);
            }

            var appId = _config["Facebook:AppId"];
            var appSecret = _config["Facebook:AppSecret"];
            var graphApiVersion = _config["Facebook:GraphApiVersion"];

            if (string.IsNullOrWhiteSpace(appId) ||
                string.IsNullOrWhiteSpace(appSecret) ||
                string.IsNullOrWhiteSpace(graphApiVersion))
            {
                throw new InvalidOperationException(_localizer["FacebookAuthenticationNotConfigured"]);
            }

            using var httpClient = new HttpClient();
            var appAccessToken = $"{appId}|{appSecret}";
            var debugUrl =
                $"https://graph.facebook.com/{graphApiVersion}/debug_token" +
                $"?input_token={Uri.EscapeDataString(dto.AccessToken)}" +
                $"&access_token={Uri.EscapeDataString(appAccessToken)}";

            var debugResponse = await httpClient.GetAsync(debugUrl);
            var debugJson = await debugResponse.Content.ReadAsStringAsync();

            if (!debugResponse.IsSuccessStatusCode)
            {
                throw new UnauthorizedAccessException(_localizer["FacebookRejectedAccessToken"]);
            }

            var debugResult = JsonSerializer.Deserialize<FacebookDebugResponse>(debugJson);

            if (debugResult?.Data == null)
            {
                throw new UnauthorizedAccessException(_localizer["FacebookInvalidDebugResponse"]);
            }

            if (!debugResult.Data.IsValid)
            {
                throw new UnauthorizedAccessException(_localizer["FacebookExpiredOrInvalidToken"]);
            }

            if (debugResult.Data.AppId != appId)
            {
                throw new UnauthorizedAccessException(_localizer["FacebookWrongAppId"]);
            }

            var userUrl =
                $"https://graph.facebook.com/{graphApiVersion}/me" +
                $"?fields=id,email,first_name,last_name" +
                $"&access_token={Uri.EscapeDataString(dto.AccessToken)}";

            var userResponse = await httpClient.GetAsync(userUrl);
            var userJson = await userResponse.Content.ReadAsStringAsync();

            if (!userResponse.IsSuccessStatusCode)
            {
                throw new UnauthorizedAccessException(
                    _localizer["UnableToRetrieveFacebookAccountInformation"]);
            }

            var facebookUser = JsonSerializer.Deserialize<FacebookUserResponse>(userJson);

            if (facebookUser == null || string.IsNullOrWhiteSpace(facebookUser.Id))
            {
                throw new UnauthorizedAccessException(_localizer["UnableToRetrieveFacebookAccountInformation"]);
            }

            if (string.IsNullOrWhiteSpace(facebookUser.Email))
            {
                throw new ForbiddenException(_localizer["FacebookDidNotProvideEmailAddress"]);
            }

            var email = facebookUser.Email.Trim().ToLowerInvariant();
            var user = await _db.Users.Include(u => u.AttributeValues).FirstOrDefaultAsync(u => u.Email.ToLower() == email);
            if (user == null)
            {
                if (dto.Role == UserRole.Administrator)
                {
                    throw new ForbiddenException(_localizer["CannotRegisterAsAdministrator"]);
                }

                var firstNameAttribute = await _db.Attributes.FirstOrDefaultAsync(a => a.Id == (int)BuiltInAttributes.FirstName);
                var lastNameAttribute = await _db.Attributes.FirstOrDefaultAsync(a => a.Id == (int)BuiltInAttributes.LastName);

                if (firstNameAttribute == null || lastNameAttribute == null)
                {
                    throw new InvalidOperationException(_localizer["BuiltInAttributesNotFound"]);
                }

                user = new User
                {
                    Email = email,
                    Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    Role = dto.Role,
                    AttributeValues = new List<AttributeValue>()
                };

                user.AttributeValues.Add(
                    new AttributeValue
                    {
                        AttributeId = firstNameAttribute.Id,
                        Value = facebookUser.FirstName ?? string.Empty
                    });

                user.AttributeValues.Add(
                    new AttributeValue
                    {
                        AttributeId = lastNameAttribute.Id,
                        Value = facebookUser.LastName ?? string.Empty
                    });

                await _db.Users.AddAsync(user);
                await _db.SaveChangesAsync();
            }

            return GenerateToken(user);
        }

        private string GenerateToken(User user)
        {
            if (user.IsBlocked)
            {
                throw new ForbiddenException(_localizer["UserBlocked"]);
            }

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
