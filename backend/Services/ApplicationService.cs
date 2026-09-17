using backend.Data;
using backend.Dtos.Application;
using backend.enums;
using backend.Localization;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace backend.Services
{
    public class ApplicationService
    {
        private readonly DataContext _db;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public ApplicationService(DataContext db, IStringLocalizer<SharedResource> localizer)
        {
            _db = db;
            _localizer = localizer;
        }

        public async Task<List<ApplicationDto>> GetAll(int pageNumber, int pageSize)
        {
            return await _db.CVs.
                AsNoTracking()
                .Select(cv => new ApplicationDto
                {
                    CvId = cv.Id,
                    CandidateId = cv.UserId,
                    CandidateName = cv.User.AttributeValues
                    .FirstOrDefault(x => x.Attribute.Id == (int)BuiltInAttributes.FirstName).Value,
                    PositionId = cv.PositionId,
                    Level = cv.User.AttributeValues
                    .Where(x => x.Attribute.Name == "Level")
                    .Select(av => av.Value).FirstOrDefault(),
                    PositionTitle = cv.Position.Title,
                    CreatedAt = cv.CreatedAt
                }).OrderByDescending(x => x.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}
