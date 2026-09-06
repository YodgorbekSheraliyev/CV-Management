using backend.Dtos;
using backend.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

namespace backend
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            var statusCode = exception switch
            {
                NotFoundException => StatusCodes.Status404NotFound,
                InvalidDataException => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError
            };

            httpContext.Response.StatusCode = statusCode;
            await httpContext.Response.WriteAsJsonAsync(CommonResponse<string>.Fail(exception.Message), cancellationToken:  cancellationToken);

            return true;
        }
    }
}
