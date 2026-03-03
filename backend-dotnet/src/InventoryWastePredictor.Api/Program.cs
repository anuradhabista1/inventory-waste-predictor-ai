using InventoryWastePredictor.Api.Routes;
using InventoryWastePredictor.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

// Services — singletons preserve in-memory state
builder.Services.AddSingleton<AuthService>();
builder.Services.AddSingleton<IntakeService>();
builder.Services.AddSingleton<SummaryService>();
builder.Services.AddSingleton<ReportService>();
builder.Services.AddSingleton<PredictorService>();

// OpenAPI / Swagger
builder.Services.AddOpenApi();

// Bind to port 8000
builder.WebHost.UseUrls("http://0.0.0.0:8000");

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

// Health check
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Route groups
app.MapAuthRoutes();
app.MapIntakeRoutes();
app.MapInventoryRoutes();
app.MapSummaryRoutes();
app.MapReportRoutes();
app.MapPredictRoutes();

app.Run();

// Make Program class accessible for integration tests
public partial class Program { }
