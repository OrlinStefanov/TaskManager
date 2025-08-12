using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.DTO;
using TaskManager.Models;

namespace TaskManager.Extensions
{
	public static class Endpoints
	{
		//map endpoints for the application
		public static void MapEndpoints(this WebApplication app)
		{
			//MapUserEndpointsTestSeeder(app); // This method maps user-related endpoints for testing and seeding purposes.
			UserRegisterEnpoints(app); // This method maps user registration and login endpoints.
		}

		public static void MapUserEndpointsTestSeeder(this WebApplication app)
		{
			//GET USER'S INFORMATION
			app.MapGet("/users/info", async (UserManager<ApplicationUser> userManager) =>
			{
				var users = await userManager.Users.ToListAsync();
				var user_Info = users.Select(u => new
				{
					u.Id,
					u.UserName,
					u.Email,
					u.PasswordHash
				}).ToList();

				return Results.Ok(user_Info);
			}).WithSummary("Returns every user info");

			//POST USER INFORMATION
			app.MapPost("/users", async (
				UserManager<ApplicationUser> userManager,
				[FromBody] ApplicationUserDTO model) =>
			{
				var user_info = new ApplicationUser
				{
					UserName = model.User_Name,
					Email = model.User_Email,
					PasswordHash = model.User_Password
				};

				if (string.IsNullOrEmpty(user_info.UserName) ||
					string.IsNullOrEmpty(user_info.Email) ||
					string.IsNullOrEmpty(user_info.PasswordHash))
				{
					return Results.BadRequest("User information is incomplete.");
				}

				var result = await userManager.CreateAsync(user_info, model.User_Password);

				if (result.Succeeded)
				{
					return Results.Created($"/users/{user_info.Id}", user_info);
				}

				return Results.BadRequest(result.Errors.Select(e => e.Description));
			}).WithSummary("Creates user using Name, Password and Email");
		}
		public static void UserRegisterEnpoints(this WebApplication app)
		{
			//register user
			app.MapPost("/register", async (
				UserManager<ApplicationUser> userManager,
				[FromBody] ApplicationUserDTO model) =>
			{
				//check for incomplete user information
				if (string.IsNullOrEmpty(model.User_Email)) return Results.BadRequest("Email is required.");
				if (string.IsNullOrEmpty(model.User_Name)) return Results.BadRequest("Username is required.");
				if (string.IsNullOrEmpty(model.User_Password)) return Results.BadRequest("Password is required.");

				//check for existing email
				var existingEmail = await userManager.FindByEmailAsync(model.User_Email);

				if (existingEmail != null)
				{
					return Results.BadRequest("Email already exists.");
				}

				//check for existing username
				var existingUser = await userManager.FindByNameAsync(model.User_Name);
				if (existingUser != null)
				{
					return Results.BadRequest("Username already exists.");
				}

				var result = await userManager.CreateAsync(new ApplicationUser
				{
					UserName = model.User_Name,
					Email = model.User_Email,
				}, model.User_Password);

				if (result.Succeeded)
				{
					return Results.Ok("User registered successfully.");
				}

				return Results.BadRequest(result.Errors.Select(e => e.Description));
			}).WithSummary("Registers new user by given username, email and password");

			//login user
			app.MapPost("/login", async
				(
				UserManager<ApplicationUser> userManager,
				SignInManager<ApplicationUser> signInManager,
				[FromBody] LogInDTO model) =>
			{
				if (string.IsNullOrEmpty(model.UserNameOrEmail) || string.IsNullOrEmpty(model.Password))
				{
					return Results.BadRequest("Username and password are required.");
				}
				
				var user = await userManager.FindByNameAsync(model.UserNameOrEmail) ??
					await userManager.FindByEmailAsync(model.UserNameOrEmail);

				if (user == null)
				{
					return Results.NotFound("User not found.");
				}

				var result = await signInManager.PasswordSignInAsync(user, model.Password, model.RememberMe, false);

				if (result.Succeeded)
				{
					return Results.Ok("User logged in successfully.");
				}

				return Results.BadRequest("Invalid login attempt.");

			}).WithSummary("Logs in a user using Name or Email and Password");

			//get current user info by remember me cookie
			app.MapGet("/current-user", async (
				UserManager<ApplicationUser> userManager,
				SignInManager<ApplicationUser> signInManager) =>
			{
				var user = await userManager.GetUserAsync(signInManager.Context.User);
				if (user == null)
				{
					return Results.NotFound("User not found.");
				}
				var userInfo = new
				{
					user.Id,
					user.UserName,
					user.Email
				};
				return Results.Ok(userInfo);
			}).WithSummary("Returns current user's information based on the remember me cookie");
		}
	}
}
