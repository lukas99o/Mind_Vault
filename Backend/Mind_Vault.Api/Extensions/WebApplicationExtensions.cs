using Microsoft.AspNetCore.Identity;
using Mind_Vault.Api.Models;

namespace Mind_Vault.Api.Extensions;

public static class WebApplicationExtensions
{
    public static async Task SeedAdminAsync(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<WebApplication>>();

            // Ensure Admin and User roles exist
            var adminRoleExists = await roleManager.RoleExistsAsync("Admin");
            if (!adminRoleExists)
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
                logger.LogInformation("Admin role created.");
            }

            var userRoleExists = await roleManager.RoleExistsAsync("User");
            if (!userRoleExists)
            {
                await roleManager.CreateAsync(new IdentityRole("User"));
                logger.LogInformation("User role created.");
            }

            // Seed default admin account if configured
            var adminSeedConfig = app.Configuration.GetSection("AdminSeed");
            var adminEmail = adminSeedConfig["Email"];
            var adminPassword = adminSeedConfig["Password"];

            if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword))
            {
                var adminExists = await userManager.FindByEmailAsync(adminEmail);
                if (adminExists is null)
                {
                    var adminUser = new ApplicationUser
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        EmailConfirmed = true
                    };

                    var createResult = await userManager.CreateAsync(adminUser, adminPassword);
                    if (createResult.Succeeded)
                    {
                        var roleResult = await userManager.AddToRoleAsync(adminUser, "Admin");
                        if (roleResult.Succeeded)
                        {
                            logger.LogInformation("Default admin account created with email {Email}.", adminEmail);
                        }
                        else
                        {
                            logger.LogError("Failed to assign Admin role to seeded admin account: {Errors}", 
                                string.Join(", ", roleResult.Errors.Select(e => e.Description)));
                        }
                    }
                    else
                    {
                        logger.LogError("Failed to create seeded admin account: {Errors}", 
                            string.Join(", ", createResult.Errors.Select(e => e.Description)));
                    }
                }
                else
                {
                    logger.LogInformation("Admin account already exists with email {Email}.", adminEmail);
                }
            }
            else if (app.Environment.IsDevelopment())
            {
                logger.LogWarning("AdminSeed configuration is not set. No default admin account will be created.");
            }
        }
    }
}