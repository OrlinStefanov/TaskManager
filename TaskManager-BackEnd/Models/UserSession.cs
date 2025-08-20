namespace TaskManager.Models
{
	public class UserSession
	{
		public Guid SessionId { get; set; }           
		public string? SessionName { get; set; }

		public string? UserId { get; set; }

		public Session? Session { get; set; }
		public ApplicationUser? User { get; set; }

		public string? Role { get; set; }
	}
}
