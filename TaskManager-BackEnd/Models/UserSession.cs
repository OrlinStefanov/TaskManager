namespace TaskManager.Models
{
	public class UserSession
	{
		public string? UserId { get; set; }
		public ApplicationUser? User { get; set; }

		public Guid SessionId { get; set; }
		public Session? Session { get; set; }

		public string? Role { get; set; }  //should be "Creator" and "Editor"
	}
}
