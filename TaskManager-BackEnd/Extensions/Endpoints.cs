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
			MapUserEndpoints(app);
		}

		public static void MapUserEndpoints(this WebApplication app)
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
	}
}
