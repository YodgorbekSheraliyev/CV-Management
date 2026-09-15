using backend.Dtos;
using backend.Dtos.Post;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PostsController : ControllerBase
    {
        private readonly PostService _postService;
        public PostsController(PostService postService)
        {
            _postService = postService;
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
            var post = await _postService.Create(createPostDto);
            return Ok(CommonResponse<PostDto>.Ok(post));
        }
    }
}
