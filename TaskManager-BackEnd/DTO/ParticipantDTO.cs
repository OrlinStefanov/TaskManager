namespace TaskManager.DTO
{
	public class ParticipantDTO
	{
		public string? UserId { get; set; }
		public string? UserName { get; set; }
		public string? UserEmail { get; set; }
		public string? Role { get; set; } // "Creator" or "Editor"
	}
}
