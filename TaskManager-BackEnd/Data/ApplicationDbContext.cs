using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TaskManager.Models;

namespace TaskManager.Data
{
	public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
	{
		public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
		: base(options) { }

		public DbSet<Session> Sessions { get; set; }
		public DbSet<UserSession> UserSessions { get; set; }
		public DbSet<TaskItem> TaskItems { get; set; }

		protected override void OnModelCreating(ModelBuilder builder)
		{
			base.OnModelCreating(builder);

			// Configure composite key for UserSession (many-to-many)
			builder.Entity<UserSession>()
				.HasKey(us => new { us.UserId, us.SessionId });

			builder.Entity<UserSession>()
				.HasOne(us => us.User)
				.WithMany(u => u.UserSessions)
				.HasForeignKey(us => us.UserId);

			builder.Entity<UserSession>()
				.HasOne(us => us.Session)
				.WithMany(s => s.UserSessions)
				.HasForeignKey(us => us.SessionId);
		}
	}
}
