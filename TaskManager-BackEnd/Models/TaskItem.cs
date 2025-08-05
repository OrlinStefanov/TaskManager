namespace TaskManager.Models
{
	public class TaskItem
	{
		public Guid Id { get; set; } = Guid.NewGuid();
		public string? Title { get; set; }
		public string? Description { get; set; }
		public DateTime DueDate { get; set; }

		public Guid SessionId { get; set; }
		public Session? Session { get; set; }

		public string? AssignedToUserId { get; set; }  // may be removed i don't need it
		public ApplicationUser? AssignedToUser { get; set; }
	}
}
