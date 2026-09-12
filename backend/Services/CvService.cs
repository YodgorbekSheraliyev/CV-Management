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

        public async Task<CvDto> Create(CreateCvDto dto)
        {
            var position = await _db.Positions
                .Include(p => p.Attributes)
                .Include(p => p.PositionAccessRules)
                    .ThenInclude(r => r.Attribute)
                .Include(p => p.Tags)
                .FirstOrDefaultAsync(p => p.Id == dto.PositionId);

            if (position is null)
            {
                throw new NotFoundException(_localizer["PositionNotFound"]);
            }

            if (await _db.CVs.AnyAsync(c => c.UserId == dto.UserId && c.PositionId == dto.PositionId))
            {
                throw new BadRequestException(_localizer["CvAlreadyExistsForPosition"]);
            }

            var user = await _db.Users.Include(u => u.AttributeValues).FirstOrDefaultAsync(u => u.Id == dto.UserId);
            if (user is null)
            {
                throw new NotFoundException(_localizer["UserNotFound"]);
            }

            var attributeIds = position.Attributes.Select(a => a.Id).ToList();
            var userAttributeIds = user.AttributeValues.Select(av => av.AttributeId).ToHashSet();
            attributeIds = attributeIds.Where(attributeId =>userAttributeIds.Contains(attributeId)).ToList();
            var projectIds = await GetMatchingProjectIds(dto.UserId,position);

            var cv = new CV
            {
                UserId = dto.UserId,
                PositionId = position.Id,
                Status = CVStatus.Published,
                AttributeIds = attributeIds,
                ProjectIds = projectIds,
                Likes = new List<Like>(),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _db.CVs.Add(cv);
            await _db.SaveChangesAsync();
            return await GetById(cv.Id, dto.UserId);
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

            if (!cv.AttributeIds.Contains(dto.AttributeValueId))
            {
                throw new BadRequestException(_localizer["AttributeNotInCv"]);
            }

            var attributeValue = await _db.AttributeValues
                .FirstOrDefaultAsync(v => v.UserId == userId && v.AttributeId == dto.AttributeValueId);

            if (attributeValue is null)
            {
                attributeValue = new AttributeValue
                {
                    UserId = userId,
                    AttributeId = dto.AttributeValueId,
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

        public async Task Delete(DeleteCvDto dto)
        {
            var cv = await _db.CVs.FirstOrDefaultAsync(c => c.Id == dto.Id);
            if (cv is null)
            {
                throw new NotFoundException(_localizer["CvNotFound"]);
            }

            var isAdmin = await _db.Users.AnyAsync(u => u.Id == dto.UserId && u.Role == UserRole.Administrator);
            if (cv.UserId != dto.UserId && !isAdmin)
            {
                throw new ForbiddenException(_localizer["NotYourCv"]);
            }

            _db.CVs.Remove(cv);
            await _db.SaveChangesAsync();
        }

        public async Task<CvDto> Publish(PublishCvDto dto)
        {
            var cv = await _db.CVs.FirstOrDefaultAsync(c => c.Id == dto.Id);
            if (cv is null)
            {
                throw new NotFoundException(_localizer["CvNotFound"]);
            }

            var isAdmin = await _db.Users.AnyAsync(u => u.Id == dto.UserId && u.Role == UserRole.Administrator);
            if (cv.UserId != dto.UserId && !isAdmin)
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

            return await GetById(dto.Id, dto.UserId);
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
                        },
                        Value = value,
                        IsEmpty = string.IsNullOrWhiteSpace(value),
                    };
                })
                .ToList();
        }
        private async Task<List<int>> GetMatchingProjectIds(int userId, Position position)
        {
            var positionTagNames = (position.Tags ?? new List<Tag>()).Select(t => t.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
            if (positionTagNames.Count == 0)
            {
                return new List<int>();
            }

            var projects = await _db.Projects
                .AsNoTracking()
                .Include(p => p.Tags)
                .Where(p => p.UserId == userId)
                .ToListAsync();

            return projects
                .Where(p => p.Tags.Any(t => positionTagNames.Contains(t.Name)))
                .OrderByDescending(p => p.StartDate)
                .Take(position.MaxProjects)
                .Select(p => p.Id)
                .ToList();
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