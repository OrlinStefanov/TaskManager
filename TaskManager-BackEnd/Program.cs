using Microsoft.AspNetCore.Identity;
using TaskManager.Models;
using TaskManager.Data;
using Microsoft.EntityFrameworkCore;
using TaskManager.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
	options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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
	options.ExpireTimeSpan = TimeSpan.FromDays(1); 
	options.SlidingExpiration = true;               
	options.LoginPath = "/login";           
	options.AccessDeniedPath = "/dashboard"; 
	options.Cookie.HttpOnly = true;                 
	options.Cookie.SameSite = SameSiteMode.None;
	options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});


// Configure CORS to allow requests from Angular development server
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAngular", policy =>
	{
		policy.WithOrigins("http://localhost:4200") // Angular dev server
			  .AllowAnyHeader()
			  .AllowAnyMethod()
			  .AllowCredentials(); // Required for cookies
	});
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

Endpoints.MapEndpoints(app);

app.UseHttpsRedirection();

app.UseCors("AllowAngular"); // Use the CORS policy defined above

app.UseAuthorization();
app.UseDeveloperExceptionPage();

app.MapControllers();

app.Run();
