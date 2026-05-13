using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Mind_Vault.Api.Models.Dtos;

namespace Mind_Vault.Api.Controllers;

public abstract class ApiControllerBase : ControllerBase
{
    protected string? GetCurrentUserId()
    {
        // NameIdentifier is set when the JWT token is created.
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    protected ActionResult UnauthorizedError(string message = "Authentication is required.")
    {
        return StatusCode(StatusCodes.Status401Unauthorized, new ApiErrorResponse(StatusCodes.Status401Unauthorized, message));
    }

    protected ActionResult NotFoundError(string message)
    {
        return NotFound(new ApiErrorResponse(StatusCodes.Status404NotFound, message));
    }
}