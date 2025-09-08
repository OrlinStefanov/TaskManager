using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using System.Xml;
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

			// Soft delete filters
			builder.Entity<Session>()
				.HasQueryFilter(s => !s.IsDeleted);

			builder.Entity<UserSession>()
				.HasQueryFilter(us => us.Session != null && !us.Session.IsDeleted);

			// ApplicationUser → UserSessions
			builder.Entity<ApplicationUser>()
				.HasMany(u => u.UserSessions)
				.WithOne(us => us.User)
				.HasForeignKey(us => us.UserId);

			// ApplicationUser → AssignedTasks
			builder.Entity<ApplicationUser>()
				.HasMany(u => u.AssignedTasks)
				.WithOne(t => t.AssignedToUser)
				.HasForeignKey(t => t.AssignedToUserId)
				.OnDelete(DeleteBehavior.SetNull);

			// UserSession composite key
			builder.Entity<UserSession>()
				.HasKey(us => new { us.UserId, us.SessionId });

			builder.Entity<UserSession>()
				.HasOne(us => us.Session)
				.WithMany(s => s.UserSessions)
				.HasForeignKey(us => us.SessionId);

			// TaskItem config
			builder.Entity<TaskItem>(entity =>
			{
				entity.HasKey(t => t.Id);

				entity.Property(t => t.Title)
					  .HasMaxLength(200);

				entity.HasOne(t => t.AssignedToUser)
					  .WithMany()
					  .HasForeignKey(t => t.AssignedToUserId)
					  .OnDelete(DeleteBehavior.Restrict);

				entity.HasOne(t => t.CreatedByUser)
					  .WithMany()
					  .HasForeignKey(t => t.CreatedByUserId)
					  .OnDelete(DeleteBehavior.Restrict);

				entity.HasOne<Session>()
					  .WithMany(s => s.Tasks)
					  .HasForeignKey(t => t.SessionId)
					  .OnDelete(DeleteBehavior.Cascade);
			});
		}
	}
}
