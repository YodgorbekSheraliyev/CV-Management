using backend.Data;
using backend.Dtos;
using backend.Dtos.Attribute;
using backend.Dtos.Position;
using backend.Dtos.Tag;
using backend.enums;
using backend.Exceptions;
using backend.Localization;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace backend.Services
{
    public class PositionService
    {
        private readonly DataContext _db;
        private readonly IStringLocalizer<SharedResource> _localizer;
        public PositionService(DataContext db, IStringLocalizer<SharedResource> localizer)
        {
            _db = db;
            _localizer = localizer;
        }

        public async Task<PagedResponse<PositionSummaryDto>> GetAll(string? search = null, int page = 1, int pageSize = 10)
        {
            page = Math.Max(page, 1);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _db.Positions.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(position =>
                    position.Title.Contains(term) ||
                    position.Description.Contains(term) ||
                    position.Tags.Any(tag => tag.Name.Contains(term)));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .AsNoTracking()
                .OrderByDescending(position => position.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PositionSummaryDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    IsPublic = p.PositionAccessRules == null || p.PositionAccessRules.Count == 0,
                    MaxProjects = p.MaxProjects,
                    Tags = p.Tags.Select(t => t.Name).ToList(),
                    CVsCount = p.CVs.Count
                })
                .ToListAsync();

            return new PagedResponse<PositionSummaryDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
        public async Task<PositionDto> GetById(int positionId, int? userId)
        {
            var dto = await _db.Positions
                .AsNoTracking()
                .Where(p => p.Id == positionId)
                .Select(p => new PositionDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    IsPublic = p.PositionAccessRules == null || p.PositionAccessRules.Count == 0,
                    MaxProjects = p.MaxProjects,
                    Tags = p.Tags.Select(t => new TagDto
                    {
                        Id = t.Id,
                        Name = t.Name
                    }).ToList(),
                    HasUserApplied = p.CVs.Any(cv => cv.UserId == userId),
                    Attributes = p.Attributes.Select(a => new AttributeDto
                    {
                        Id = a.Id,
                        Name = a.Name,
                        Category = a.Category,
                        Type = a.AttributeType,
                        Description = a.Description,
                        IsBuiltIn = a.IsBuiltIn
                    }).ToList(),
                    PositionAccessRules = p.PositionAccessRules.Select(r => new PositionAccessRule
                    {
                        Id = r.Id,
                        PositionId = r.PositionId,
                        AttributeId = r.AttributeId,
                        ComparisonType = r.ComparisonType,
                        Value = r.Value,
                        Attribute = r.Attribute
                    }).ToList(),
                    CVsCount = p.CVs.Count,
                    Version = p.Version
                })
                .FirstOrDefaultAsync();

            if (dto is null)
            {
                throw new NotFoundException(_localizer["PositionNotFound"]);
            }

            bool canAccess = await CanAccess(userId, dto.PositionAccessRules);
            if (!canAccess)
            {
                throw new ForbiddenException(_localizer["PositionAccessDenied"]);
            }

            return dto;
        }
        public async Task<PositionDto> Create(CreatePositionDto dto, int userId)
        {
            var attributes = await _db.Attributes
                .Where(a => dto.AttributeIds.Contains(a.Id))
                .ToListAsync();

            var tags = dto.TagIds?.Count > 0
                ? await _db.Tags.Where(t => dto.TagIds.Contains(t.Id)).ToListAsync()
                : new List<Tag>();

            var position = new Position
            {
                Title = dto.Title,
                Description = dto.Description,
                MaxProjects = dto.MaxProjects,
                Attributes = attributes,
                Tags = tags,
                PositionAccessRules = dto.IsPublic ? new List<PositionAccessRule>() : dto.AccessRules.Select(r => new PositionAccessRule
                {
                    AttributeId = r.AttributeId,
                    ComparisonType = r.ComparisonType,
                    Value = r.Value
                }).ToList(),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                Version = 1
            };

            _db.Positions.Add(position);
            await _db.SaveChangesAsync();

            return await GetById(position.Id, userId);
        }
        public async Task<PositionDto> Update(UpdatePositionDto dto, int userId)
        {
            var position = await _db.Positions
                .Include(p => p.Attributes)
                .Include(p => p.Tags)
                .Include(p => p.PositionAccessRules)
                .FirstOrDefaultAsync(p => p.Id == dto.Id);

            if (position is null)
            {
                throw new NotFoundException(_localizer["PositionNotFound"]);
            }
            if (position.Version != dto.Version)
            {
                throw new ConflictException(_localizer["PositionVersionNotMatch"]);
            }

            var attributes = await _db.Attributes
                .Where(a => dto.AttributeIds.Contains(a.Id))
                .ToListAsync();

            var tags = dto.TagIds is { Count: > 0 }
                ? await _db.Tags.Where(t => dto.TagIds.Contains(t.Id)).ToListAsync()
                : new List<Tag>();

            position.Title = dto.Title;
            position.Description = dto.Description;
            position.Attributes = attributes;
            position.Tags = tags;
            position.MaxProjects = dto.MaxProjects;

            position.PositionAccessRules.Clear();
            foreach (var rule in dto.IsPublic ? new List<CreateAccessRuleDto>() : dto.AccessRules)
            {
                position.PositionAccessRules.Add(new PositionAccessRule
                {
                    AttributeId = rule.AttributeId,
                    ComparisonType = rule.ComparisonType,
                    Value = rule.Value
                });
            }
            position.Version++;

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException(_localizer["PositionVersionNotMatch"]);
            }

            return await GetById(dto.Id, userId);
        }
        public async Task Delete(DeletePositionDto dto)
        {
            var position = await _db.Positions.FirstOrDefaultAsync(p => p.Id == dto.Id);
            if (position is null)
            {
                throw new NotFoundException(_localizer["PositionNotFound"]);
            }

            _db.Positions.Remove(position);
            await _db.SaveChangesAsync();
        }
        public async Task<PositionDto> Duplicate(int id, int userId)
        {
            var position = await _db.Positions
                .Include(p => p.Attributes)
                .Include(p => p.Tags)
                .Include(p => p.PositionAccessRules)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (position is null)
            {
                throw new NotFoundException(_localizer["PositionNotFound"]);
            }

            var duplicate = new Position
            {
                Title = $"{position.Title} (Copy)",
                Description = position.Description,
                MaxProjects = position.MaxProjects,
                Attributes = position.Attributes.ToList(),
                Tags = position.Tags?.ToList() ?? new(),
                PositionAccessRules = position.PositionAccessRules.Select(r => new PositionAccessRule
                {
                    AttributeId = r.AttributeId,
                    ComparisonType = r.ComparisonType,
                    Value = r.Value
                }).ToList(),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _db.Positions.Add(duplicate);
            await _db.SaveChangesAsync();

            return await GetById(duplicate.Id, userId);
        }
        public async Task<object> Apply(int positionId, int userId)
        {
            var position = await _db.Positions
                .Include(p => p.PositionAccessRules)
                .FirstOrDefaultAsync(p => p.Id == positionId);
            if (position is null)
            {
                throw new NotFoundException(_localizer["PositionNotFound"]);
            }

            if (!await CanAccess(userId, position.PositionAccessRules ?? new List<PositionAccessRule>()))
            {
                throw new ForbiddenException(_localizer["PositionAccessDenied"]);
            }

            return new { PositionId = positionId, CanCreateCv = true };
        }

        public async Task<bool> CanAccess(int? userId, List<PositionAccessRule> accessRules)
        {
            if (userId is null)
            {
                return accessRules is null || accessRules.Count == 0;
            }

            var user = await _db.Users.FindAsync(userId.Value);
            if (user is { Role: UserRole.Administrator or UserRole.Recruiter })
            {
                return true;
            }

            if (accessRules is null || accessRules.Count == 0)
            {
                return true;
            }

            var attributeIds = accessRules
                .Select(r => r.AttributeId)
                .Distinct()
                .ToList();

            var attributeValues = await _db.AttributeValues
                .AsNoTracking()
                .Where(x => x.UserId == userId.Value && attributeIds.Contains(x.AttributeId))
                .ToListAsync();

            foreach (var rule in accessRules)
            {
                var userValue = attributeValues.FirstOrDefault(x => x.AttributeId == rule.AttributeId);

                if (userValue is null)
                {
                    return false;
                }

                bool matches = rule.ComparisonType switch
                {
                    ComparisonType.Equal => userValue.Value == rule.Value,
                    ComparisonType.NotEqual => userValue.Value != rule.Value,
                    ComparisonType.LessThan => Compare(userValue.Value, rule.Value) < 0,
                    ComparisonType.LessThanOrEqual => Compare(userValue.Value, rule.Value) <= 0,
                    ComparisonType.GreaterThan => Compare(userValue.Value, rule.Value) > 0,
                    ComparisonType.GreaterThanOrEqual => Compare(userValue.Value, rule.Value) >= 0,
                    _ => false
                };

                if (!matches)
                {
                    return false;
                }
            }

            return true;
        }
        private static int Compare(string userValue, string ruleValue)
        {
            if (decimal.TryParse(userValue, out var userNumber) &&
                decimal.TryParse(ruleValue, out var ruleNumber))
            {
                return userNumber.CompareTo(ruleNumber);
            }

            return string.Compare(userValue, ruleValue, StringComparison.OrdinalIgnoreCase);
        }
    }
}