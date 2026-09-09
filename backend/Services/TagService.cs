using backend.Data;
using backend.Dtos;
using backend.Exceptions;
using backend.Localization;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace backend.Services
{
    public class TagService
    {
        private readonly DataContext _db;
        private readonly IStringLocalizer<SharedResource> _localizer;
        public TagService(DataContext db, IStringLocalizer<SharedResource> localizer)
        {
            _db = db;
            _localizer = localizer;
        }

        public async Task<List<TagDto>> GetAllTags()
        {
            return await _db.Tags
                .AsNoTracking()
                .Select(t => new TagDto
                {
                    Id = t.Id,
                    Name = t.Name
                })
                .ToListAsync();
        }

        public async Task<TagDto> GetTagById(int tagId)
        {
            return await _db.Tags
                .AsNoTracking()
                .Where(t => t.Id == tagId)
                .Select(t => new TagDto
                {
                    Id = t.Id,
                    Name = t.Name
                })
                .FirstOrDefaultAsync();
        }

        public async Task<TagDto> GetTagByName(string name)
        {
            return await _db.Tags
                .AsNoTracking()
                .Where(t => t.Name.ToLower() == name.ToLower())
                .Select(t => new TagDto
                {
                    Id = t.Id,
                    Name = t.Name
                })
                .FirstOrDefaultAsync();
        }

        public async Task<TagDto> CreateTag(CreateTagDto dto)
        {
            Tag tag = new Tag { Name = dto.Name};
            _db.Tags.Add(tag);
            await _db.SaveChangesAsync();
            return new TagDto { Id = tag.Id, Name = tag.Name };
        }

        public async Task<TagDto> UpdateTag(UpdateTagDto dto)
        {
            var tag = await _db.Tags.FindAsync(dto.Id);
            if (tag == null)
            {
                throw new NotFoundException(_localizer["TagNotFound"]);
            }
            tag.Name = dto.Name;
            await _db.SaveChangesAsync();
            return new TagDto { Id = tag.Id, Name = tag.Name };
        }

        public async Task DeleteTag(DeleteTagDto dto)
        {
            var tag = await _db.Tags.FindAsync(dto.Id);
            if (tag == null)
            {
                throw new NotFoundException(_localizer["TagNotFound"]);
            }
            _db.Tags.Remove(tag);
            await _db.SaveChangesAsync();
        }
    }
}
