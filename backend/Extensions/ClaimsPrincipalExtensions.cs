using backend.Exceptions;
using backend.Localization;
using Microsoft.Extensions.Localization;
using System.Security.Claims;

namespace backend.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user, IStringLocalizer<SharedResource> localizer)
        {
            var userIdClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                throw new NotFoundException(localizer["UserIdNotFound"]);
            }
            return int.Parse(userIdClaim.Value);
        }
    }
}
