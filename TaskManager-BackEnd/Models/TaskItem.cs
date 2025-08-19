namespace TaskManager.Models
{
	public class TaskItem
	{
		public Guid Id { get; set; } = Guid.NewGuid();
		public string? Title { get; set; }
		public string? Description { get; set; }
		public DateTime DueDate { get; set; }

		public string? AssignedToUserId { get; set; }

		public ApplicationUser? AssignedToUser { get; set; }
	}
}
