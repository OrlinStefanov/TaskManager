using Microsoft.AspNetCore.Identity;

namespace TaskManager.Models
{
	public class ApplicationUser : IdentityUser
	{
		public string? UserId { get; set; }
		public string? User_Name { get; set; }
		public string? User_Email { get; set; }
		public string? User_Password { get; set; }

		public ICollection<UserSession>? UserSessions { get; set; }
	}
}
