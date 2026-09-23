using backend.Data;
using backend.Dtos.User;
using backend.enums;
using backend.Exceptions;
using backend.Localization;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace backend.Services
{
    public class UserService
    {
        private readonly DataContext _db;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public UserService(DataContext db, IStringLocalizer<SharedResource> localizer)
        {
            _db = db;
            _localizer = localizer;
        }

        public async Task<UserDto> GetUserById(int userId)
        {
            var user = await _db.Users
                .Include(u => u.AttributeValues)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null)
            {
                throw new NotFoundException(_localizer["UserNotFound"]);
            }
            var attributeValues = await _db.AttributeValues
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var firstName = attributeValues
                .FirstOrDefault(x => x.AttributeId == (int)BuiltInAttributes.FirstName)?.Value;

            var lastName = attributeValues
                .FirstOrDefault(x => x.AttributeId == (int)BuiltInAttributes.LastName)?.Value;

            var location = attributeValues
                .FirstOrDefault(x => x.AttributeId == (int)BuiltInAttributes.Location)?.Value;

            var imageUrl = attributeValues
                .FirstOrDefault(x => x.AttributeId == (int)BuiltInAttributes.ImageUrl)?.Value;
            UserDto userDto = new UserDto()
            {
                Id = userId,
                FirstName = firstName,
                LastName = lastName,
                ImageUrl = imageUrl,
                Location = location,
                Role = user.Role.ToString(),
                Email = user.Email,
                Version = user.Version
            };

            return userDto;
        }

        public async Task<UserDto> Update(int userId, UpdateUserDto updateUserDto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user is null)
            {
                throw new NotFoundException(_localizer["UserNotFound"]);
            }

            if (user.Version != updateUserDto.Version)
            {
                throw new ConflictException(_localizer["UserVersionNotMatch"]);
            }

            var attributeValues = await _db.AttributeValues
                .Where(x => x.UserId == userId)
                .ToListAsync();

            if (updateUserDto.FirstName is not null)
            {
                var firstName = attributeValues.FirstOrDefault(x => x.AttributeId == (int)BuiltInAttributes.FirstName);

                if (firstName is null)
                {
                    firstName = new AttributeValue
                    {
                        UserId = userId,
                        AttributeId = (int)BuiltInAttributes.FirstName,
                        Value = updateUserDto.FirstName
                    };

                    _db.AttributeValues.Add(firstName);
                }
                else
                {
                    firstName.Value = updateUserDto.FirstName;
                }
            }

            if (updateUserDto.LastName is not null)
            {
                var lastName = attributeValues.FirstOrDefault(x => x.AttributeId == (int)BuiltInAttributes.LastName);
                if (lastName is null)
                {
                    lastName = new AttributeValue
                    {
                        UserId = userId,
                        AttributeId = (int)BuiltInAttributes.LastName,
                        Value = updateUserDto.LastName
                    };

                    _db.AttributeValues.Add(lastName);
                }
                else
                {
                    lastName.Value = updateUserDto.LastName;
                }
            }

            if (updateUserDto.Location is not null)
            {
                var location = attributeValues.FirstOrDefault(x => x.AttributeId == (int)BuiltInAttributes.Location);
                if (location is null)
                {
                    location = new AttributeValue
                    {
                        UserId = userId,
                        AttributeId = (int)BuiltInAttributes.Location,
                        Value = updateUserDto.Location
                    };

                    _db.AttributeValues.Add(location);
                }
                else
                {
                    location.Value = updateUserDto.Location;
                }
            }

            user.Version++;
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException(_localizer["UserVersionNotMatch"]);
            }
            return await GetUserById(userId);
        }

        public async Task<List<AdminUserDto>> GetAllForAdmin()
        {
            return await _db.Users.AsNoTracking()
                .OrderBy(user => user.Email)
                .Select(user => new AdminUserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    IsBlocked = user.IsBlocked,
                    Version = user.Version
                })
                .ToListAsync();
        }

        public async Task<AdminUserDto> UpdateRole(UpdateUserRoleDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(item => item.Id == dto.UserId);
            if (user is null)
            {
                throw new NotFoundException(_localizer["UserNotFound"]);
            }

            if (user.Version != dto.Version)
            {
                throw new ConflictException(_localizer["UserVersionNotMatch"]);
            }
            user.Role = dto.Role;
            user.Version++;
            await SaveAdminChange(user);
            return ToAdminDto(user);
        }

        public async Task<AdminUserDto> UpdateBlocked(UpdateUserBlockDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(item => item.Id == dto.UserId);
            if (user is null)
            {
                throw new NotFoundException(_localizer["UserNotFound"]);
            }

            if (user.Version != dto.Version) throw new ConflictException(_localizer["UserVersionNotMatch"]);
            user.IsBlocked = dto.IsBlocked;
            user.Version++;
            await SaveAdminChange(user);
            return ToAdminDto(user);
        }

        public async Task DeleteUser(int userId)
        {
            var user = await _db.Users.FirstOrDefaultAsync(item => item.Id == userId);
            if (user is null)
            {
                throw new NotFoundException(_localizer["UserNotFound"]);
            }
            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
        }

        private async Task SaveAdminChange(User user)
        {
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException(_localizer["UserVersionNotMatch"]);
            }
        }

        private static AdminUserDto ToAdminDto(User user) => new()
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsBlocked = user.IsBlocked,
            Version = user.Version
        };
    }
}
