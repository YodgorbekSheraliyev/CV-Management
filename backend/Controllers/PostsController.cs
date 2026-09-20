using backend.Dtos;
using backend.Dtos.Post;
using backend.Extensions;
using backend.Localization;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;


namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PostsController : ControllerBase
    {
        private readonly PostService _postService;
        private IStringLocalizer<SharedResource> _localizer;
        private int CurrentUserId => User.GetUserId(_localizer);
        public PostsController(PostService postService, IStringLocalizer<SharedResource> localizer)
        {
            _postService = postService;
            _localizer = localizer;
        }

        [HttpGet("all/{positionId}")]
        public async Task<IActionResult> GetAllByPositionId(int positionId)
        {
            var posts = await _postService.GetAllByPositionId(positionId);
            return Ok(CommonResponse<List<PostDto>>.Ok(posts));
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreatePostDto createPostDto)
        {
            var post = await _postService.Create(createPostDto, CurrentUserId);
            return Ok(CommonResponse<PostDto>.Ok(post));
        }
    }
}
