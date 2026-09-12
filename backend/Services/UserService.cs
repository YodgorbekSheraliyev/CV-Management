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
                Email = user.Email
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
                var lastName = attributeValues
                    .FirstOrDefault(x =>
                        x.AttributeId == (int)BuiltInAttributes.LastName);

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

            await _db.SaveChangesAsync();
            return await GetUserById(userId);
        }
    }
}
