using backend.Data;
using backend.Models;
using backend.Dtos.Post;
using backend.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace backend.Services
{
    public class PostService
    {
        private readonly DataContext _db;
        private readonly IConfiguration _config;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public PostService(DataContext db, IConfiguration config, IStringLocalizer<SharedResource> localizer)
        {
            _db = db;
            _config = config;
            _localizer = localizer;
        }

        public async Task<List<PostDto>> GetAllByPositionId(int positionId)
        {
            return await _db.Posts.Where(p => p.PositionId == positionId).Select(p => new PostDto
            {
                Id = p.Id,
                AuthorId = p.AuthorId,
                AuthorName = p.AuthorName,
                Content = p.Content,
                PositionId = p.PositionId,
                CreatedAt = p.CreatedAt
            }).OrderByDescending(p => p.CreatedAt).ToListAsync();
        }

        public async Task<PostDto> Create(CreatePostDto createPostDto)
        {
            var post = new Post
            {
                AuthorId = createPostDto.AuthorId,
                AuthorName = createPostDto.AuthorName,
                Content = createPostDto.Content,
                PositionId = createPostDto.PositionId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Posts.Add(post);
            await _db.SaveChangesAsync();
            return new PostDto
            {
                Id = post.Id,
                AuthorId = post.AuthorId,
                AuthorName = post.AuthorName,
                Content = post.Content,
                PositionId = post.PositionId,
                CreatedAt = post.CreatedAt
            };
        }
    }
}
