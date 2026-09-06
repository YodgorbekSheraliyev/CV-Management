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
                Role = user.Role.ToString(),
                Email = user.Email
            };

            return userDto;
        }

        public async Task<UserDto> Update(int userId, UpdateUserDto updateUserDto)
        {
            User user = await _db.Users.FirstOrDefaultAsync(X => X.Id == userId);
            if (user is null)
            {

                throw new NotFoundException(_localizer["UserNotFound"]);
            }

            var attributeValues = await _db.AttributeValues
                .Where(x => x.UserId == userId)
                .ToListAsync();
            if (updateUserDto.FirstName is not null)
            {
                var firstName = attributeValues.FirstOrDefault(x => x.AttributeId == (int)BuiltInAttributes.FirstName);
                firstName.Value = updateUserDto.FirstName;

            }
            if (updateUserDto.LastName is not null)
            {
                var lastName = attributeValues.FirstOrDefault(x => x.AttributeId == (int)BuiltInAttributes.LastName);
                lastName.Value = updateUserDto.LastName;
            }
            if (updateUserDto.Location is not null)
            {
                var location = attributeValues.FirstOrDefault(x => x.AttributeId == (int)BuiltInAttributes.Location);
                location.Value = updateUserDto.FirstName;
            }

            await _db.SaveChangesAsync();
            return await GetUserById(userId);
        }
    }
}
