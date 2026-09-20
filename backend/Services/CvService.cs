using backend.Data;
using backend.Dtos.Cv;
using backend.Dtos.Project;
using backend.enums;
using backend.Exceptions;
using backend.Localization;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace backend.Services
{
    public class CvService
    {
        private readonly DataContext _db;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public CvService(DataContext db, IStringLocalizer<SharedResource> localizer)
        {
            _db = db;
            _localizer = localizer;
        }

        public async Task<List<CvSummaryDto>> GetAll()
        {
            return await _db.CVs
                .AsNoTracking()
                .Include(c => c.Position)
                .Include(c => c.Likes)
                .Select(cv => new CvSummaryDto
                {
                    Id = cv.Id,
                    PositionId = cv.PositionId,
                    PositionTitle = cv.Position != null ? cv.Position.Title : string.Empty,
                    LikeCount = cv.Likes.Count,
                    Status = cv.Status,
                    CreatedAt = cv.CreatedAt
                })
                .ToListAsync();
        }
        public async Task<List<CvSummaryDto>> GetAllForUserId(int userId)
        {
            return await _db.CVs
                .AsNoTracking()
                .Include(c => c.Position)
                .Include(c => c.Likes)
                .Where(c => c.UserId == userId)
                .Select(x => new CvSummaryDto
                {
                    Id = x.Id,
                    PositionId = x.PositionId,
                    LikeCount = x.Likes.Count,
                    PositionTitle = x.Position.Title,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<CvSummaryDto>> GetByPositionId(int positionId)
        {
            return await _db.CVs
                .AsNoTracking()
                .Include(c => c.Position)
                .Include(c => c.Likes)
                .Where(c => c.PositionId == positionId && c.Status == CVStatus.Published)
                .Select(x => new CvSummaryDto
                {
                    Id = x.Id,
                    PositionId = x.PositionId,
                    LikeCount = x.Likes.Count,
                    PositionTitle = x.Position.Title,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<CvDto> Create(CreateCvDto dto, int userId)
        {
            var position = await _db.Positions
                .Where(p => p.Id == dto.PositionId)
                .Select(p => new
                {
                    p.Id,
                    AttributeIds = p.Attributes.Select(a => a.Id).ToList()
                }).FirstOrDefaultAsync();

            if (position is null)
            {
                throw new NotFoundException(_localizer["PositionNotFound"]);
            }

            if (await _db.CVs.AnyAsync(c => c.UserId == userId && c.PositionId == dto.PositionId))
            {
                throw new BadRequestException(_localizer["CvAlreadyExistsForPosition"]);
            }

            if (!await _db.Users.AnyAsync(u => u.Id == userId))
            {
                throw new NotFoundException(_localizer["UserNotFound"]);
            }

            var projectIds = await GetMatchingProjectIds(userId, dto.PositionId);

            var cv = new CV
            {
                UserId = userId,
                PositionId = position.Id,
                Status = CVStatus.Draft,
                AttributeIds = position.AttributeIds,
                ProjectIds = projectIds,
                Likes = new List<User>(),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _db.CVs.Add(cv);
            await _db.SaveChangesAsync();

            return await GetById(cv.Id, userId);
        }
        public async Task<CvDto> GetById(int cvId, int userId)
        {
            var cv = await _db.CVs
                .AsNoTracking()
                .Include(c => c.Position)
                    .ThenInclude(p => p.Attributes)
                .Include(c => c.Likes)
                .FirstOrDefaultAsync(c => c.Id == cvId);

            if (cv is null)
            {
                throw new NotFoundException(_localizer["CvNotFound"]);
            }

            User user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            EnsureViewable(cv, user);

            var attributes = await _db.Attributes
                .AsNoTracking()
                .Where(a => cv.AttributeIds.Contains(a.Id))
                .ToListAsync();

            var attributeValues = await GetAttributeValues(cv.UserId);

            var projects = await _db.Projects
                .AsNoTracking()
                .Include(p => p.Tags)
                .Where(p => cv.ProjectIds.Contains(p.Id))
                .ToListAsync();

            return new CvDto
            {
                Id = cv.Id,
                PositionId = cv.PositionId,
                PositionTitle = cv.Position.Title,
                LikeCount = cv.Likes.Count,
                Status = cv.Status,
                Attributes = BuildAttributes(attributes, attributeValues),
                CreatedAt = cv.CreatedAt,
                IsLikedByCurrentUser = cv.Likes.Any(l => l.Id == userId),
                Projects = projects.Select(project => new ProjectDto
                {
                    Id = project.Id,
                    Name = project.Name,
                    StartDate = project.StartDate,
                    EndDate = project.EndDate,
                    Description = project.Description,
                    Tags = project.Tags.Select(t => t.Name).ToList()
                }).ToList()
            };
        }
        public async Task<CvDto> Like(int cvId, int userId)
        {
            var cv = await _db.CVs.Include(c => c.Likes).FirstOrDefaultAsync(c => c.Id == cvId);
            if (cv == null)
            {
                throw new NotFoundException(_localizer["CvNotFound"]);
            }
            var recruiter = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (recruiter == null)
            {
                throw new NotFoundException(_localizer["UserNotFound"]);
            }

            if (!cv.Likes.Any(l => l.Id == userId))
            {
                cv.Likes.Add(recruiter);
            }
            await _db.SaveChangesAsync();
            return await GetById(cvId, userId);
        }
        public async Task<CvDto> Unlike(int cvId, int userId)
        {
            var cv = await _db.CVs.Include(c => c.Likes).FirstOrDefaultAsync(c => c.Id == cvId);
            if (cv == null)
            {
                throw new NotFoundException(_localizer["CvNotFound"]);
            }
            var recruiter = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (recruiter == null)
            {
                throw new NotFoundException(_localizer["UserNotFound"]);
            }
            if (cv.Likes.Any(l => l.Id == userId))
            {
                cv.Likes.Remove(recruiter);
            }
            await _db.SaveChangesAsync();
            return await GetById(cvId, userId);
        }
        public async Task<CvDto> UpdateAttributeValue(UpdateCvAttributeValueDto dto, int userId)
        {
            var cv = await _db.CVs.AsNoTracking().FirstOrDefaultAsync(c => c.Id == dto.CvId);
            if (cv is null)
            {
                throw new NotFoundException(_localizer["CvNotFound"]);
            }

            var isAdmin = await _db.Users.AnyAsync(u => u.Id == userId && u.Role == UserRole.Administrator);
            if (cv.UserId != userId && !isAdmin)
            {
                throw new ForbiddenException(_localizer["NotYourCv"]);
            }

            var attributeValue = await _db.AttributeValues.FirstOrDefaultAsync(v => v.UserId == userId && v.AttributeId == dto.AttributeId);

            if (attributeValue is null)
            {
                attributeValue = new AttributeValue
                {
                    UserId = userId,
                    AttributeId = dto.AttributeId,
                    Value = dto.Value,
                };

                _db.AttributeValues.Add(attributeValue);
            }
            else
            {
                attributeValue.Value = dto.Value;
            }

            cv.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return await GetById(dto.CvId, userId);
        }

        public async Task Delete(DeleteCvDto dto, int userId)
        {
            var cv = await _db.CVs.FirstOrDefaultAsync(c => c.Id == dto.Id);
            if (cv is null)
            {
                throw new NotFoundException(_localizer["CvNotFound"]);
            }

            var isAdmin = await _db.Users.AnyAsync(u => u.Id == userId && u.Role == UserRole.Administrator);
            if (cv.UserId != userId && !isAdmin)
            {
                throw new ForbiddenException(_localizer["NotYourCv"]);
            }

            _db.CVs.Remove(cv);
            await _db.SaveChangesAsync();
        }

        public async Task<CvDto> Publish(PublishCvDto dto, int userId)
        {
            var cv = await _db.CVs.FirstOrDefaultAsync(c => c.Id == dto.Id);
            if (cv is null)
            {
                throw new NotFoundException(_localizer["CvNotFound"]);
            }

            var isAdmin = await _db.Users.AnyAsync(u => u.Id == userId && u.Role == UserRole.Administrator);
            if (cv.UserId != userId && !isAdmin)
            {
                throw new ForbiddenException(_localizer["NotYourCv"]);
            }

            var attributeValues = await GetAttributeValues(cv.UserId);
            var hasEmptyAttribute = cv.AttributeIds.Any(attributeId =>
            {
                var value = attributeValues.FirstOrDefault(v => v.AttributeId == attributeId)?.Value;
                return string.IsNullOrWhiteSpace(value);
            });

            if (hasEmptyAttribute)
            {
                throw new BadRequestException(_localizer["CvHasEmptyAttributes"]);
            }

            cv.Status = CVStatus.Published;
            cv.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return await GetById(dto.Id, userId);
        }
        private async Task<List<AttributeValue>> GetAttributeValues(int userId)
        {
            return await _db.AttributeValues
                .AsNoTracking()
                .Where(v => v.UserId == userId)
                .ToListAsync();
        }
        private static List<CvAttributeDto> BuildAttributes(List<Models.Attribute> attributes, List<AttributeValue> values)
        {
            return attributes
                .Select(attribute =>
                {
                    var value = values.FirstOrDefault(v => v.AttributeId == attribute.Id)?.Value;
                    return new CvAttributeDto
                    {
                        AttributeId = attribute.Id,
                        Attribute = new Dtos.Attribute.AttributeDto
                        {
                            Id = attribute.Id,
                            Name = attribute.Name,
                            Category = attribute.Category,
                            Type = attribute.AttributeType,
                            Description = attribute.Description,
                            IsBuiltIn = attribute.IsBuiltIn,
                            Options = attribute.Options
                        },
                        Value = value,
                        IsEmpty = string.IsNullOrWhiteSpace(value),
                    };
                })
                .ToList();
        }
        private async Task<List<int>> GetMatchingProjectIds(int userId, int positionId)
        {
            var position = await _db.Positions
                .Where(p => p.Id == positionId)
                .Select(p => new
                {
                    p.MaxProjects,
                    TagNames = p.Tags
                        .Select(t => t.Name)
                        .ToList()
                }).FirstOrDefaultAsync();
            if (position is null || position.TagNames.Count == 0)
            {
                return new List<int>();
            }

            var positionTagNames = position.TagNames.ToHashSet(StringComparer.OrdinalIgnoreCase);
            return await _db.Projects
                .AsNoTracking()
                .Where(p =>
                    p.UserId == userId &&
                    p.Tags.Any(t => positionTagNames.Contains(t.Name)))
                .OrderByDescending(p => p.StartDate)
                .Take(position.MaxProjects)
                .Select(p => p.Id)
                .ToListAsync();
        }
        private void EnsureViewable(CV cv, User user)
        {
            if (cv.UserId == user.Id || user.Role == UserRole.Administrator)
            {
                return;
            }
            if (user.Role == UserRole.Recruiter && cv.Status != CVStatus.Published)
            {
                throw new ForbiddenException(_localizer["CvNotPublished"]);
            }
        }
    }
}