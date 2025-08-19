using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTO;
using TaskManager.Models;

namespace TaskManager.Extensions
{
	public static class Endpoints
	{
		//map endpoints for the application
		public static void MapEndpoints(this WebApplication app)
		{
			UserRegisterEnpoints(app); // This method maps user registration and login endpoints.
			SessionsEndpoints(app); // This method maps session-related endpoints.
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

			//returns user if exists
			app.MapGet("/users/{userNameOrEmail}", async (
				UserManager<ApplicationUser> userManager,
				string userNameOrEmail) =>
			{
				var user = await userManager.FindByNameAsync(userNameOrEmail) ?? await userManager.FindByEmailAsync(userNameOrEmail);

				if (user is null)
				{
					return Results.NotFound("User not found check input data");
				}

				var result = new
				{
					user.UserName,
					user.Email,
				};

				return Results.Ok(result);
			}).WithSummary("Gives the user searched by userNameOrEmail and returns his name and email if valid");
		}
		public static void SessionsEndpoints(this WebApplication app)
		{
			//create session
			app.MapPost("/sessions", async (
				MinimalSessionDTO model,
				ApplicationDbContext db) =>
			{
				if (string.IsNullOrEmpty(model.Title) || string.IsNullOrEmpty(model.Description)) 
				{
					return Results.BadRequest("All fields should be fill");
				}

				var session = new Session
				{
					Id = Guid.NewGuid(),
					Title = model.Title,
					Description = model.Description,
					UserSessions = new List<UserSession>(),
				};

				if (model.UserSessions == null || model.UserSessions.Count == 0)
				{
					return Results.BadRequest("At least one user session is required.");
				}

				foreach (var userSession in model.UserSessions)
				{
					var user = await db.Users.FindAsync(userSession.UserName);
					if (user != null)
					{
						var userSessionNew = new UserSession
						{
							SessionId = session.Id,
							SessionName = session.Title,
							UserName = user.UserName,
							User = user,
							Role = userSession.Role ?? "User"
						};

						session.UserSessions.Add(userSessionNew);
						await db.UserSessions.AddAsync(userSessionNew);
					}
				}

				db.Sessions.Add(session);
				await db.SaveChangesAsync();

				return Results.Created($"/sessions/{session.Id}", session);	
			}).WithSummary("Creates session in which can participate people");

			//get session request
			app.MapGet("/sessions/{id}", async (
				Guid id, ApplicationDbContext db) =>
				{
					var session = await db.Sessions
						.Include(s => s.UserSessions)
						.ThenInclude(us => us.User)
						.FirstOrDefaultAsync(s => s.Id == id);

					return session != null ? Results.Ok(session) : Results.NotFound();
				});
		}
	}
}
