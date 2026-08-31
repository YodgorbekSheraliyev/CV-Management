using backend.Data;
using backend.Dtos;
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

        public async Task<List<AttributeDto>> GetAllAttributes()
        {
            return await _db.Attributes.Select(x => new AttributeDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Category = x.Category,
                IsBuiltIn = x.IsBuiltIn,
                Type = x.AttributeType
            }).ToListAsync();
        }

    }
}
