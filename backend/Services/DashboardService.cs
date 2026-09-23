using backend.Data;
using backend.Dtos;
using backend.enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class DashboardService
    {
        private readonly DataContext _db;

        public DashboardService(DataContext db)
        {
            _db = db;
        }

        public async Task<DashboardDto> Get()
        {
            var dayAgo = DateTime.UtcNow.AddHours(-24);
            var publicPositions = _db.Positions
                .AsNoTracking()
                .Where(position => position.PositionAccessRules == null || position.PositionAccessRules.Count == 0);

            var positionData = await publicPositions
                .Select(position => new DashboardPositionDto
                {
                    Id = position.Id,
                    Title = position.Title,
                    Description = position.Description,
                    IsPublic = true,
                    CvCount = position.CVs.Count(cv => cv.Status == CVStatus.Published),
                    Tags = position.Tags.Select(tag => tag.Name).ToList()
                })
                .ToListAsync();

            return new DashboardDto
            {
                LatestPositions = positionData
                    .OrderByDescending(position => position.Id)
                    .Take(5)
                    .ToList(),
                PopularPositions = positionData
                    .OrderByDescending(position => position.CvCount)
                    .ThenBy(position => position.Title)
                    .Take(5)
                    .ToList(),
                Tags = await _db.Tags
                    .AsNoTracking()
                    .Select(tag => new DashboardTagDto
                    {
                        Name = tag.Name,
                        UsageCount = tag.Positions.Count + tag.Projects.Count
                    })
                    .OrderByDescending(tag => tag.UsageCount)
                    .Take(30)
                    .ToListAsync(),
                Statistics = new DashboardStatsDto
                {
                    NewCvsLast24Hours = await _db.CVs.CountAsync(cv => cv.CreatedAt >= dayAgo),
                    TotalPositions = await publicPositions.CountAsync(),
                    TotalCandidates = await _db.Users.CountAsync(user => user.Role == UserRole.Candidate),
                    TotalRecruiters = await _db.Users.CountAsync(user => user.Role == UserRole.Recruiter),
                    TotalPublishedCvs = await _db.CVs.CountAsync(cv => cv.Status == CVStatus.Published)
                }
            };
        }
    }
}