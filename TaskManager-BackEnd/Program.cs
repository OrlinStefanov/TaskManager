using Microsoft.AspNetCore.Identity;
using TaskManager.Models;
using TaskManager.Data;
using Microsoft.EntityFrameworkCore;
using TaskManager.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
	?? builder.Configuration["DefaultConnection"];

builder.Services.AddDbContext<ApplicationDbContext>(options =>
	options.UseNpgsql(connectionString));


builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
	.AddEntityFrameworkStores<ApplicationDbContext>()
	.AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>(options =>
{
	// Optional: password rules, lockout settings, etc.
	options.Password.RequireDigit = true;
	options.Password.RequiredLength = 6;
	options.Password.RequireNonAlphanumeric = false;
	options.User.RequireUniqueEmail = true;
});

builder.Services.ConfigureApplicationCookie(options =>
{
	options.ExpireTimeSpan = TimeSpan.FromDays(7); 
	options.SlidingExpiration = true;               
	options.Cookie.HttpOnly = true;                 
	options.Cookie.SameSite = SameSiteMode.None;
	options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAngular", policy =>
	{
		policy.WithOrigins("https://taskmanager-production-1.up.railway.app") // frontend URL
			  .AllowAnyHeader()
			  .AllowAnyMethod() // important: allow POST, PUT, DELETE
			  .AllowCredentials();
	});
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Serve Angular SPA first
app.UseDefaultFiles();
app.UseStaticFiles();

// Enable CORS for API
app.UseCors("AllowAngular");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// API routes
Endpoints.MapEndpoints(app);

// Fallback to Angular index.html for all other routes
app.MapFallbackToFile("index.html");

app.Run();
