namespace TaskManager.Models
{
	public class TaskItem
	{
		public Guid Id { get; set; } = Guid.NewGuid();
		public string? Title { get; set; }
		public string? Description { get; set; }
		public DateTime DueDate { get; set; }

		public string? AssignedToUserId { get; set; }
		public string? CreatedByUserId { get; set; }
		public Guid SessionId { get; set; }

		public string? Status { get; set; } = "To Do"; // Possible values: To Do, In Progress, Done
		public string? Priority { get; set; } = "Low"; // Possible values: Low, Medium, High

		public ApplicationUser? AssignedToUser { get; set; }
		public ApplicationUser? CreatedByUser { get; set; }
	}
}
