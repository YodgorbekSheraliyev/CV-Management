using backend.Data;
using backend.Dtos.Project;
using backend.Exceptions;
using backend.Localization;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace backend.Services
{
    public class ProjectService
    {
        private readonly DataContext _db;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public ProjectService(DataContext db, IStringLocalizer<SharedResource> localizer)
        {
            _db = db;
            _localizer = localizer;
        }

        public async Task<List<ProjectDto>> GetAll(int userId)
        {
            var projects = await _db.Projects.Include(x => x.Tags)
                .AsNoTracking()
                .Include(p => p.Tags)
                .Where(p => p.UserId == userId)
                .ToListAsync();

            return projects.Select(ToDto).ToList();
        }

        public async Task<ProjectDto> GetOne(int userId, int projectId)
        {
            var project = await _db.Projects.Include(x => x.Tags)
                .AsNoTracking()
                .Include(p => p.Tags)
                .FirstOrDefaultAsync(p => p.UserId == userId && p.Id == projectId);

            if (project is null)
            {
                throw new NotFoundException(_localizer["ProjectNotFound"]);
            }

            return ToDto(project);
        }

        public async Task<ProjectDto> Create(CreateProjectDto dto)
        {
            ValidateDates(dto);

            var project = new Project
            {
                UserId = dto.UserId,
                Name = dto.Name,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Description = dto.Description,
                Tags = await ResolveTagsAsync(dto.Tags)
            };

            _db.Projects.Add(project);
            await _db.SaveChangesAsync();

            return ToDto(project);
        }

        public async Task<ProjectDto> Update(UpdateProjectDto dto)
        {
            ValidateDates(dto);
            var project = await _db.Projects
                .Include(p => p.Tags)
                .FirstOrDefaultAsync(p => p.Id == dto.Id);

            if (project is null)
            {

                throw new NotFoundException(_localizer["ProjectNotFound"]);
            }

            if (project.UserId != dto.UserId)
            {
                throw new UnauthorizedAccessException(_localizer["NotYourProject"]);
            }

            project.Name = dto.Name;
            project.StartDate = dto.StartDate;
            project.EndDate = dto.EndDate;
            project.Description = dto.Description;
            project.Tags = await ResolveTagsAsync(dto.Tags);

            await _db.SaveChangesAsync();
            return ToDto(project);
        }

        public async Task Delete(DeleteProjectDto dto)
        {

            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == dto.Id);
            if (project is null)
            {
                throw new NotFoundException(_localizer["ProjectNotFound"]);
            }

            _db.Projects.Remove(project);
            await _db.SaveChangesAsync();
        }

        private void ValidateDates(CreateProjectDto dto)
        {
            if (dto.EndDate is not null && dto.EndDate < dto.StartDate)
                throw new InvalidDataException(_localizer["PeriodEndBeforeStart"]);
        }
        private void ValidateDates(UpdateProjectDto dto)
        {
            if (dto.EndDate is not null && dto.EndDate < dto.StartDate)
                throw new InvalidDataException(_localizer["PeriodEndBeforeStart"]);
        }

        private async Task<List<Tag>> ResolveTagsAsync(List<string> tagNames)
        {
            var normalized = tagNames.Select(t => t.Trim()).Where(t => t.Length > 0).Distinct().ToList();
            if (normalized.Count == 0) return new List<Tag>();

            var existing = await _db.Tags.Where(t => normalized.Contains(t.Name)).ToListAsync();
            var missing = normalized.Except(existing.Select(t => t.Name)).Select(name => new Tag { Name = name }).ToList();

            if (missing.Count > 0)
            {
                _db.Tags.AddRange(missing);
                await _db.SaveChangesAsync();
            }

            return existing.Concat(missing).ToList();
        }

        private static ProjectDto ToDto(Project p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Description = p.Description,
            Tags = p.Tags?.Select(t => t.Name).ToList() ?? new()
        };
    }
}