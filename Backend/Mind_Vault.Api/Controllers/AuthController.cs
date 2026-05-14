using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Mind_Vault.Api.Models;
using Mind_Vault.Api.Models.Dtos;

namespace Mind_Vault.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private static readonly TimeSpan TokenLifetime = TimeSpan.FromHours(48);

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        // Check if user with this email already exists
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            return BadRequest(new ApiErrorResponse(StatusCodes.Status400BadRequest, "Email is already in use."));
        }

        // Create new user entity
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email
        };

        // Attempt to create user with password validation
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.ToDictionary(e => "IdentityError", e => new[] { e.Description });
            return BadRequest(new ApiErrorResponse(StatusCodes.Status400BadRequest, "Registration failed.", errors));
        }

        // Assign User role to newly registered user
        var roleResult = await _userManager.AddToRoleAsync(user, "User");
        if (!roleResult.Succeeded)
        {
            var errors = roleResult.Errors.ToDictionary(e => "IdentityError", e => new[] { e.Description });
            return BadRequest(new ApiErrorResponse(StatusCodes.Status400BadRequest, "Failed to assign default role.", errors));
        }

        return Ok(new { message = "User registered successfully." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        // Locate user by email
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized(new ApiErrorResponse(StatusCodes.Status401Unauthorized, "Invalid email or password."));
        }

        // Verify password without locking out account on failed attempts
        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!signInResult.Succeeded)
        {
            return Unauthorized(new ApiErrorResponse(StatusCodes.Status401Unauthorized, "Invalid email or password."));
        }

        // Generate JWT token containing user claims and roles
        var token = await CreateJwtTokenAsync(user);
        return Ok(new AuthResponse(token, DateTime.UtcNow.Add(TokenLifetime)));
    }

    private async Task<string> CreateJwtTokenAsync(ApplicationUser user)
    {
        // Load JWT configuration from appsettings
        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("Missing Jwt:Issuer configuration.");
        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("Missing Jwt:Audience configuration.");
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Missing Jwt:Key configuration.");

        // Get all roles assigned to the user
        var userRoles = await _userManager.GetRolesAsync(user);

        // Build claims list starting with standard identity claims
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Add role claims for authorization
        claims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));

        // Configure token signing with symmetric key
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.Add(TokenLifetime);

        // Create and sign the token
        var tokenDescriptor = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }
}