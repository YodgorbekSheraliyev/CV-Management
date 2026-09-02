using backend.Data;
using backend.Dtos;
using backend.Exceptions;
using backend.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace backend.Services
{
    public class AttributeService
    {
        private readonly DataContext _db;
        private readonly IStringLocalizer<SharedResource> _localizer;
        public AttributeService(DataContext db, IStringLocalizer<SharedResource> localizer)
        {
            _db = db;
            _localizer = localizer;
        }

        public async Task<List<AttributeDto>> GetAll()
        {
            return await _db.Attributes.AsNoTracking().Select(x => new AttributeDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Category = x.Category,
                IsBuiltIn = x.IsBuiltIn,
                Type = x.AttributeType
            }).ToListAsync();
        }

        public async Task<AttributeDto> GetById(int id)
        {
            var attribute = await _db.Attributes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (attribute is null)
            {
                throw new NotFoundException(_localizer["AttributeNotFound"]);
            }
            return new AttributeDto
            {
                Id = attribute.Id,
                Name = attribute.Name,
                Category = attribute.Category,
                Description = attribute.Description,
                IsBuiltIn = attribute.IsBuiltIn,
                Type = attribute.AttributeType
            };
        }

        public async Task<AttributeDto> Create(CreateAttributeDto createAttributeDto)
        {
            if (await _db.Attributes.AnyAsync(x => x.Name == createAttributeDto.Name))
            {
                throw new ConflictException(_localizer["AttributeAlreadyExists"]);
            }
            Models.Attribute attribute = new()
            {
                Name = createAttributeDto.Name,
                AttributeType = createAttributeDto.Type,
                Category = createAttributeDto.Category,
                Description = createAttributeDto.Description
            };
            await _db.Attributes.AddAsync(attribute);
            await _db.SaveChangesAsync();

            return new AttributeDto
            {
                Id = attribute.Id,
                Name = attribute.Name,
                Category = attribute.Category,
                Description = attribute.Description,
                IsBuiltIn = attribute.IsBuiltIn,
                Type = attribute.AttributeType
            };
        }

        public async Task<AttributeDto> Update(UpdateAttributeDto updateAttributeDto)
        {
            Models.Attribute attribute = await _db.Attributes.FirstOrDefaultAsync(x => x.Id == updateAttributeDto.Id);
            if (attribute is null)
            {
                throw new NotFoundException(_localizer["AttributeNotFound"]);
            }
            if (await _db.Attributes.AnyAsync(x => x.Name == updateAttributeDto.Name && x.Id != updateAttributeDto.Id))
            {
                throw new ConflictException(_localizer["AttributeAlreadyExists"]);
            }

            if (attribute.IsBuiltIn)
            {
                throw new UnauthorizedAccessException(_localizer["CannotUpdateBuiltInAttribute"]);
            }

            attribute.Name = updateAttributeDto.Name;
            attribute.Category = updateAttributeDto.Category;
            attribute.AttributeType = updateAttributeDto.Type;
            attribute.Description = updateAttributeDto.Description;
            await _db.SaveChangesAsync();

            return new AttributeDto
            {
                Id = attribute.Id,
                Name = attribute.Name,
                Category = attribute.Category,
                Description = attribute.Description,
                IsBuiltIn = attribute.IsBuiltIn,
                Type = attribute.AttributeType
            };
        }

        public async Task<bool> Delete(DeleteAttributeDto deleteAttributeDto)
        {
            var attribute = await _db.Attributes.FirstOrDefaultAsync(x => x.Id == deleteAttributeDto.Id);
            if (attribute is null)
            {
                throw new NotFoundException(_localizer["AttributeNotFound"]);
            }
            _db.Attributes.Remove(attribute);
            await _db.SaveChangesAsync();
            return true;
        }

    }
}
