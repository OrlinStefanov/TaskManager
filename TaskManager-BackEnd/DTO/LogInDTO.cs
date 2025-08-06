namespace TaskManager.DTO
{
	public class LogInDTO
	{
		public string? UserNameOrEmail { get; set; }
		public string? Password { get; set; }

		public bool RememberMe { get; set; } = false;
	}
}
