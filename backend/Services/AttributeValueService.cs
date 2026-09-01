using backend.Models;
using backend.Data;
using backend.Dtos;
using backend.Exceptions;
using backend.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace backend.Services
{
    public class AttributeValueService
    {
        private readonly DataContext _db;
        private readonly IStringLocalizer<SharedResource> _localizer;
        public AttributeValueService(DataContext db, IStringLocalizer<SharedResource> localizer)
        {
            _db = db;
            _localizer = localizer;
        }

        public async Task<List<AttributeValueDto>> GetAllForUserId(int userId)
        {
            var values = await _db.AttributeValues.AsNoTracking()
                .Include(x => x.Attribute)
                .Where(x => x.UserId == userId)
                .Select(x => new AttributeValueDto
                {
                    Id = x.Id,
                    AttributeId = x.AttributeId,
                    UserId = x.UserId,
                    Value = x.Value,
                    Attribute = new AttributeDto
                    {
                        Id = x.Attribute.Id,
                        Category = x.Attribute.Category,
                        Description = x.Attribute.Description,
                        IsBuiltIn = x.Attribute.IsBuiltIn,
                        Name = x.Attribute.Name,
                        Type = x.Attribute.AttributeType
                    }
                })
                .ToListAsync();

            return values;
        }
        public async Task<AttributeValueDto> Create(CreateAttributeValueDto createAttributeValueDto)
        {
            Models.Attribute attribute = await _db.Attributes.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == createAttributeValueDto.AttributeId);
            if (attribute is null)
            {
                throw new NotFoundException(_localizer["AttributeNotFound"]);
            }
            AttributeValue attributeValue = new AttributeValue
            {
                AttributeId = createAttributeValueDto.AttributeId,
                UserId = createAttributeValueDto.UserId,
                Value = createAttributeValueDto.Value
            };

            await _db.AttributeValues.AddAsync(attributeValue);
            await _db.SaveChangesAsync();

            return new AttributeValueDto
            {
                Id = attributeValue.Id,
                AttributeId = createAttributeValueDto.AttributeId,
                UserId = createAttributeValueDto.UserId,
                Value = createAttributeValueDto.Value,
                Attribute = new AttributeDto
                {
                    Id = attribute.Id,
                    Category = attribute.Category,
                    Description = attribute.Description,
                    IsBuiltIn = attribute.IsBuiltIn,
                    Name = attribute.Name,
                    Type = attribute.AttributeType
                }
            };
        }

        public async Task<AttributeValueDto> Update(UpdateAttributeValueDto updateAttributeValueDto)
        {
            AttributeValue attributeValue = await _db.AttributeValues.FirstOrDefaultAsync(x => x.Id == updateAttributeValueDto.Id);
            if (attributeValue is null)
            {
                throw new NotFoundException(_localizer["AttributeValueNotFound"]);
            }

            attributeValue.UserId = updateAttributeValueDto.UserId;
            attributeValue.AttributeId = updateAttributeValueDto.AttributeId;
            attributeValue.Value = updateAttributeValueDto.Value;
            await _db.SaveChangesAsync();
            return new AttributeValueDto
            {
                Id = attributeValue.Id,
                AttributeId = attributeValue.AttributeId,
                UserId = attributeValue.UserId,
                Value = attributeValue.Value,
                Attribute = new AttributeDto
                {
                    Id = attributeValue.Attribute.Id,
                    Category = attributeValue.Attribute.Category,
                    Description = attributeValue.Attribute.Description,
                    IsBuiltIn = attributeValue.Attribute.IsBuiltIn,
                    Name = attributeValue.Attribute.Name,
                    Type = attributeValue.Attribute.AttributeType
                }
            };
        }

        public async Task<bool> Delete(DeleteAttributeValueDto deleteAttributeValueDto)
        {
            AttributeValue attributeValue = await _db.AttributeValues.FirstOrDefaultAsync(x => x.Id == deleteAttributeValueDto.Id);
            if (attributeValue is null)
            {
                throw new NotFoundException(_localizer["AttributeValueNotFound"]);
            }
            _db.AttributeValues.Remove(attributeValue);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
