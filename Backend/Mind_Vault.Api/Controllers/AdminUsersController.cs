using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;

namespace Mind_Vault.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/users")]
public class AdminUsersController : ApiControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<AdminUsersController> _logger;

    public AdminUsersController(
        UserManager<ApplicationUser> userManager,
        ILogger<AdminUsersController> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<UserListResponse>> GetAllUsers()
    {
        var users = _userManager.Users.ToList();
        var userResponses = new List<UserResponse>();

        foreach (var user in users)
        {
            var roles = (await _userManager.GetRolesAsync(user)).AsReadOnly();
            userResponses.Add(new UserResponse(user.Id, user.Email ?? string.Empty, user.UserName ?? string.Empty, roles));
        }

        return Ok(new UserListResponse(userResponses, users.Count));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> GetUserById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
        {
            return NotFoundError("User was not found.");
        }

        var roles = (await _userManager.GetRolesAsync(user)).AsReadOnly();
        return Ok(new UserResponse(user.Id, user.Email ?? string.Empty, user.UserName ?? string.Empty, roles));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserResponse>> UpdateUser(string id, UpdateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName))
        {
            return BadRequest(new ApiErrorResponse(StatusCodes.Status400BadRequest, "UserName is required."));
        }

        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
        {
            return NotFoundError("User was not found.");
        }

        // Check if new username is already taken
        var existingUser = await _userManager.FindByNameAsync(request.UserName);
        if (existingUser is not null && existingUser.Id != id)
        {
            return BadRequest(new ApiErrorResponse(StatusCodes.Status400BadRequest, "Username is already in use."));
        }

        user.UserName = request.UserName;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = result.Errors.ToDictionary(e => "IdentityError", e => new[] { e.Description });
            return BadRequest(new ApiErrorResponse(StatusCodes.Status400BadRequest, "Failed to update user.", errors));
        }

        var roles = (await _userManager.GetRolesAsync(user)).AsReadOnly();
        return Ok(new UserResponse(user.Id, user.Email ?? string.Empty, user.UserName ?? string.Empty, roles));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
        {
            return NotFoundError("User was not found.");
        }

        var result = await _userManager.DeleteAsync(user);

        if (!result.Succeeded)
        {
            var errors = result.Errors.ToDictionary(e => "IdentityError", e => new[] { e.Description });
            return BadRequest(new ApiErrorResponse(StatusCodes.Status400BadRequest, "Failed to delete user.", errors));
        }

        _logger.LogInformation("User {UserId} ({Email}) was deleted.", user.Id, user.Email);
        return NoContent();
    }
}
