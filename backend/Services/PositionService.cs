using backend.Data;
using backend.Dtos.Attribute;
using backend.Dtos.Position;
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

        public async Task<List<PositionSummaryDto>> GetAll()
        {
            return await _db.Positions
                .AsNoTracking()
                .Select(p => new PositionSummaryDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    IsPublic = p.IsPublic,
                    MaxProjects = p.MaxProjects,
                    Tags = p.Tags.Select(t => t.Name).ToList(),
                })
                .ToListAsync();
        }
        public async Task<PositionDto> GetById(int positionId, int userId)
        {

            var position = await _db.Positions
                .AsNoTracking()
                .Include(p => p.Tags)
                .Include(p => p.Attributes)
                .Include(p => p.Discussion)
                .Include(p => p.CVs)
                .Include(p => p.PositionAccessRules)
                .FirstOrDefaultAsync(p => p.Id == positionId);
            if (position is null)
            {
                throw new NotFoundException(_localizer["PositionNotFound"]);
            }
            bool canAccess = await CanAccess(userId, position);
            if (!canAccess)
            {
                throw new ForbiddenException(_localizer["PositionAccessDenied"]);
            }

            return new PositionDto
            {
                Id = position.Id,
                Title = position.Title,
                Description = position.Description,
                IsPublic = position.IsPublic,
                MaxProjects = position.MaxProjects,
                Tags = position.Tags,
                Attributes = position.Attributes.Select(a => new AttributeDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Category = a.Category,
                    Type = a.AttributeType,
                    Description = a.Description,
                    IsBuiltIn = a.IsBuiltIn
                }).ToList(),
                PositionAccessRules = position.PositionAccessRules,
                Discussion = position.Discussion,
                CVs = position.CVs
            };
        }

        public async Task<PositionDto> Create(CreatePositionDto dto, int userId)
        {
            Position position = new Position
            {
                Title = dto.Title,
                Description = dto.Description,
                IsPublic = dto.IsPublic,
                MaxProjects = dto.MaxProjects,
                Attributes = dto.Attributes.Select(a => new Models.Attribute
                {
                    Id = a.Id,
                    Name = a.Name,
                    Category = a.Category,
                    AttributeType = a.Type,
                    Description = a.Description,
                    IsBuiltIn = a.IsBuiltIn
                }).ToList(),
                Tags = dto.Tags,
                PositionAccessRules = dto.PositionAccessRules,
                Discussion = dto.Discussion,
                CVs = dto.CVs
            };

            _db.Positions.Add(position);
            await _db.SaveChangesAsync();

            return await GetById(position.Id, userId);
        }

        public async Task<PositionDto> Update(UpdatePositionDto dto, int userId)
        {
            Position position = await _db.Positions
                .Include(p => p.Attributes)
                .Include(p => p.Tags)
                .Include(p => p.PositionAccessRules)
                .FirstOrDefaultAsync(p => p.Id == dto.Id);

            if (position is null)
            {
                throw new NotFoundException(_localizer["PositionNotFound"]);
            }

            position.Title = dto.Title;
            position.Description = dto.Description;
            position.Attributes = dto.Attributes.Select(a => new Models.Attribute
            {
                Id = a.Id,
                Name = a.Name,
                Category = a.Category,
                AttributeType = a.Type,
                Description = a.Description,
                IsBuiltIn = a.IsBuiltIn
            }).ToList();
            position.PositionAccessRules = dto.PositionAccessRules;
            position.Tags = dto.Tags;
            position.CVs = dto.CVs;
            position.Discussion = dto.Discussion;
            position.IsPublic = dto.IsPublic;
            position.MaxProjects = dto.MaxProjects;


            await _db.SaveChangesAsync();
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
                IsPublic = position.IsPublic,
                MaxProjects = position.MaxProjects,
                Attributes = position.Attributes.ToList(),
                Tags = position.Tags?.ToList() ?? new(),
                PositionAccessRules = position.PositionAccessRules.Select(r => new PositionAccessRule
                {
                    AttributeId = r.AttributeId,
                    ComparisonType = r.ComparisonType,
                    Value = r.Value
                }).ToList(),
            };

            _db.Positions.Add(duplicate);
            await _db.SaveChangesAsync();

            return await GetById(duplicate.Id, userId);
        }

        private async Task<bool> CanAccess(int userId, Position position)
        {
            if (position.IsPublic)
                return true;

            if (position.PositionAccessRules.Count == 0)
                return true;

            var attributeIds = position.PositionAccessRules
                .Select(r => r.AttributeId)
                .Distinct()
                .ToList();

            var attributeValues = await _db.AttributeValues
                .AsNoTracking()
                .Where(x =>
                    x.UserId == userId &&
                    attributeIds.Contains(x.AttributeId))
                .ToListAsync();

            foreach (var rule in position.PositionAccessRules)
            {
                var userValue = attributeValues
                    .FirstOrDefault(x => x.AttributeId == rule.AttributeId);

                if (userValue is null)
                    return false;

                bool matches = rule.ComparisonType switch
                {
                    ComparisonType.Equal =>
                        userValue.Value == rule.Value,

                    ComparisonType.LessThan =>
                        Compare(userValue.Value, rule.Value) < 0,

                    ComparisonType.LessThanOrEqual =>
                        Compare(userValue.Value, rule.Value) <= 0,

                    ComparisonType.GreaterThan =>
                        Compare(userValue.Value, rule.Value) > 0,

                    ComparisonType.GreaterThanOrEqual =>
                        Compare(userValue.Value, rule.Value) >= 0,

                    _ => false
                };

                if (!matches)
                    return false;
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