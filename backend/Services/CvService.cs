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

        public async Task<List<CvSummaryDto>> GetMine(int userId)
        {
            var cvs = await _db.CVs.AsNoTracking()
                .Include(c => c.Position).Include(c => c.Likes)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            return cvs.Select(ToSummaryDto).ToList();
        }

        public async Task<List<CvSummaryDto>> GetByPosition(int positionId)
        {
            var cvs = await _db.CVs.AsNoTracking()
                .Include(c => c.Position).Include(c => c.Likes)
                .Where(c => c.PositionId == positionId && c.Status == CVStatus.Published)
                .ToListAsync();

            return cvs.Select(ToSummaryDto).ToList();
        }

        public async Task<CvDto> Create(CreateCvDto dto, int userId)
        {
            if (await _db.CVs.AnyAsync(c => c.UserId == userId && c.PositionId == dto.PositionId))
                throw new BadRequestException(_localizer["CvAlreadyExistsForPosition"]);

            var position = await _db.Positions
                .Include(p => p.PositionAccessRules).ThenInclude(r => r.Attribute)
                .FirstOrDefaultAsync(p => p.Id == dto.PositionId)
                ?? throw new NotFoundException(_localizer["PositionNotFound"]);

            var candidateValues = await GetAttributeValues(userId);
            if (!CanAccess(position, candidateValues))
                throw new ForbiddenException(_localizer["PositionAccessDenied"]);

            var cv = new CV { UserId = userId, PositionId = dto.PositionId, Likes = new List<Like>() };
            _db.CVs.Add(cv);
            await _db.SaveChangesAsync();

            return await GetById(cv.Id, userId, isRecruiterOrAdmin: false, isAdmin: false);
        }

        public async Task<CvDto> GetById(int cvId, int userId, bool isRecruiterOrAdmin, bool isAdmin)
        {
            var cv = await _db.CVs.AsNoTracking()
                .Include(c => c.Position).ThenInclude(p => p.Attributes)
                .Include(c => c.Likes)
                .FirstOrDefaultAsync(c => c.Id == cvId)
                ?? throw new NotFoundException(_localizer["CvNotFound"]);

            EnsureViewable(cv, userId, isRecruiterOrAdmin, isAdmin);

            var candidateValues = await GetAttributeValues(cv.UserId);

            return new CvDto
            {
                Id = cv.Id,
                PositionId = cv.PositionId!.Value,
                PositionTitle = cv.Position!.Title,
                LikeCount = cv.Likes.Count,
                Status = cv.Status,
                Fields = BuildFields(cv.Position.Attributes, candidateValues),
                Projects = await BuildMatchingProjects(cv.UserId, cv.Position)
            };
        }

        public async Task<CvDto> UpdateAttributeValue(UpdateCvAttributeValueDto dto, int userId)
        {
            var cv = await GetOwned(dto.CvId, userId);

            if (!await _db.Attributes.AnyAsync(a => a.Id == dto.AttributeId))
                throw new NotFoundException(_localizer["AttributeNotFound"]);

            var existing = await _db.AttributeValues
                .FirstOrDefaultAsync(v => v.UserId == cv.UserId && v.AttributeId == dto.AttributeId);

            if (existing is null)
                _db.AttributeValues.Add(new AttributeValue { UserId = cv.UserId, AttributeId = dto.AttributeId, Value = dto.Value });
            else
                existing.Value = dto.Value;

            await _db.SaveChangesAsync();
            return await GetById(dto.CvId, userId, isRecruiterOrAdmin: false, isAdmin: false);
        }

        public async Task<CvDto> Publish(int cvId, int userId)
        {
            var cv = await GetOwned(cvId, userId);

            var detail = await GetById(cvId, userId, isRecruiterOrAdmin: false, isAdmin: false);
            if (detail.Fields.Any(f => f.IsEmpty))
                throw new BadRequestException(_localizer["CvHasEmptyFields"]);

            cv.Status = CVStatus.Published;
            await _db.SaveChangesAsync();
            return await GetById(cvId, userId, isRecruiterOrAdmin: false, isAdmin: false);
        }

        public async Task Delete(DeleteCvDto dto, int userId, bool isAdmin)
        {
            var cv = await _db.CVs.FirstOrDefaultAsync(c => c.Id == dto.Id)
                ?? throw new NotFoundException(_localizer["CvNotFound"]);

            if (cv.UserId != userId && !isAdmin)
                throw new ForbiddenException(_localizer["NotYourCv"]);

            _db.CVs.Remove(cv);
            await _db.SaveChangesAsync();
        }

        // ---------- private helpers ----------

        private async Task<CV> GetOwned(int cvId, int userId)
        {
            var cv = await _db.CVs.FirstOrDefaultAsync(c => c.Id == cvId)
                ?? throw new NotFoundException(_localizer["CvNotFound"]);

            if (cv.UserId != userId)
                throw new ForbiddenException(_localizer["NotYourCv"]);

            return cv;
        }

        private void EnsureViewable(CV cv, int userId, bool isRecruiterOrAdmin, bool isAdmin)
        {
            if (cv.UserId == userId || isAdmin) return;
            if (!isRecruiterOrAdmin) throw new ForbiddenException(_localizer["NotYourCv"]);
            if (cv.Status != CVStatus.Published) throw new ForbiddenException(_localizer["CvNotPublished"]);
        }

        private Task<List<AttributeValue>> GetAttributeValues(int userId) =>
            _db.AttributeValues.AsNoTracking().Include(v => v.Attribute).Where(v => v.UserId == userId).ToListAsync();

        private static List<CvFieldDto> BuildFields(List<Models.Attribute> attributes, List<AttributeValue> values) =>
            attributes.Select(attr =>
            {
                var value = values.FirstOrDefault(v => v.AttributeId == attr.Id)?.Value;
                return new CvFieldDto
                {
                    Attribute = new Dtos.Attribute.AttributeDto
                    {
                        Id = attr.Id,
                        Name = attr.Name,
                        Category = attr.Category,
                        Type = attr.AttributeType,
                        Description = attr.Description,
                        IsBuiltIn = attr.IsBuiltIn
                    },
                    Value = value,
                    IsEmpty = string.IsNullOrWhiteSpace(value)
                };
            }).ToList();

        private async Task<List<ProjectDto>> BuildMatchingProjects(int userId, Position position)
        {
            var tagNames = (position.Tags ?? new List<Tag>()).Select(t => t.Name).ToHashSet();

            var projects = await _db.Projects.AsNoTracking().Include(p => p.Tags)
                .Where(p => p.UserId == userId).ToListAsync();

            return projects
                .Where(p => p.Tags.Any(t => tagNames.Contains(t.Name)))
                .OrderByDescending(p => p.StartDate)
                .Take(position.MaxProjects)
                .Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Description = p.Description,
                    Tags = p.Tags.Select(t => t.Name).ToList()
                })
                .ToList();
        }

        // Same CanAccess/Compare pattern as PositionService, inlined here per the earlier
        // decision to drop the separate evaluator class.
        private bool CanAccess(Position position, List<AttributeValue> candidateValues)
        {
            if (position.IsPublic) return true;
            if (position.PositionAccessRules.Count == 0) return true;

            foreach (var rule in position.PositionAccessRules)
            {
                var value = candidateValues.FirstOrDefault(v => v.AttributeId == rule.AttributeId);
                if (value is null) return false;

                bool matches = rule.ComparisonType switch
                {
                    ComparisonType.Equal => value.Value == rule.Value,
                    ComparisonType.LessThan => Compare(value.Value, rule.Value) < 0,
                    ComparisonType.LessThanOrEqual => Compare(value.Value, rule.Value) <= 0,
                    ComparisonType.GreaterThan => Compare(value.Value, rule.Value) > 0,
                    ComparisonType.GreaterThanOrEqual => Compare(value.Value, rule.Value) >= 0,
                    _ => false
                };

                if (!matches) return false;
            }

            return true;
        }

        private static int Compare(string userValue, string ruleValue)
        {
            if (decimal.TryParse(userValue, out var userNumber) && decimal.TryParse(ruleValue, out var ruleNumber))
                return userNumber.CompareTo(ruleNumber);

            return string.Compare(userValue, ruleValue, StringComparison.OrdinalIgnoreCase);
        }

        private static CvSummaryDto ToSummaryDto(CV cv) => new()
        {
            Id = cv.Id,
            PositionId = cv.PositionId ?? 0,
            PositionTitle = cv.Position?.Title ?? "",
            LikeCount = cv.Likes?.Count ?? 0,
            Status = cv.Status
        };
    }
}