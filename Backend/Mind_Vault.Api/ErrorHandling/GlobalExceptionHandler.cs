using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Mind_Vault.Api.Models.Dtos;

namespace Mind_Vault.Api.ErrorHandling;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (httpContext.Response.HasStarted)
        {
            return false;
        }

        var (statusCode, message, logLevel) = exception switch
        {
            DbUpdateConcurrencyException => (StatusCodes.Status409Conflict, "A concurrency conflict occurred.", LogLevel.Warning),
            DbUpdateException => (StatusCodes.Status409Conflict, "The request could not be completed because of a database conflict.", LogLevel.Warning),
            OperationCanceledException => (StatusCodes.Status503ServiceUnavailable, "The request was canceled.", LogLevel.Warning),
            InvalidOperationException => (StatusCodes.Status500InternalServerError, "An unexpected server error occurred.", LogLevel.Error),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected server error occurred.", LogLevel.Error)
        };

        _logger.Log(logLevel, exception, "Unhandled exception while processing {Method} {Path}",
            httpContext.Request.Method,
            httpContext.Request.Path);

        httpContext.Response.Clear();
        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";

        var response = new ApiErrorResponse(
            statusCode,
            message,
            TraceId: httpContext.TraceIdentifier);

        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);
        return true;
    }
}