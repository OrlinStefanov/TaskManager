using TaskManager.Models;

namespace TaskManager.DTO
{
	public class MinimalSessionDTO
	{
		public Guid Id { get; set; }
		public string? Title { get; set; }
		public string? Description { get; set; }
		public List<MinimalUserSessionDTO>? UserSessions { get; set; }
	}

	public class MinimalUserSessionDTO
	{
		public Guid SessionId { get; set; }
		public string? SessionName { get; set; }
		public string? UserName { get; set; }
		public string? Role { get; set; }
	}
}
