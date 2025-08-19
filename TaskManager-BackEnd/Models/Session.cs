using TaskManager.DTO;

namespace TaskManager.Models
{
	public class Session
	{
		public Guid Id { get; set; } = Guid.NewGuid();
		public string? Title { get; set; }
		public string? Description { get; set; }

		public ICollection<UserSession>? UserSessions { get; set; }
		public ICollection<TaskItem>? Tasks { get; set; }
	}
}
