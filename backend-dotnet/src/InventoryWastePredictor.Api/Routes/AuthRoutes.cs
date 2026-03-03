using InventoryWastePredictor.Api.Models;
using InventoryWastePredictor.Api.Services;

namespace InventoryWastePredictor.Api.Routes;

public static class AuthRoutes
{
    public static void MapAuthRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/auth").WithTags("Auth");

        group.MapPost("/login", (LoginRequest body, AuthService auth) =>
        {
            try
            {
                var result = auth.Login(body.Username, body.Password);
                return Results.Ok(new AuthResponse(result["token"], result["username"], result["role"]));
            }
            catch (InvalidOperationException ex)
            {
                return Results.Unauthorized();
            }
        });

        group.MapGet("/me", (HttpContext ctx, AuthService auth) =>
        {
            var token = GetBearerToken(ctx);
            if (token is null) return Results.Unauthorized();
            try
            {
                var user = auth.GetCurrentUser(token);
                return Results.Ok(new UserResponse(user["username"], user["role"]));
            }
            catch (InvalidOperationException)
            {
                return Results.Unauthorized();
            }
        });

        group.MapPost("/logout", (HttpContext ctx, AuthService auth) =>
        {
            var token = GetBearerToken(ctx);
            if (token is not null) auth.Logout(token);
            return Results.Ok(new { message = "Logged out successfully." });
        });
    }

    internal static string? GetBearerToken(HttpContext ctx)
    {
        var auth = ctx.Request.Headers.Authorization.FirstOrDefault();
        if (auth is null || !auth.StartsWith("Bearer ")) return null;
        return auth["Bearer ".Length..].Trim();
    }

    internal static IResult? RequireAuth(HttpContext ctx, AuthService auth,
        out Dictionary<string, string>? user)
    {
        user = null;
        var token = GetBearerToken(ctx);
        if (token is null) return Results.Unauthorized();
        try
        {
            user = auth.GetCurrentUser(token);
            return null;
        }
        catch (InvalidOperationException)
        {
            return Results.Unauthorized();
        }
    }

    internal static IResult? RequireRole(HttpContext ctx, AuthService auth, string role,
        out Dictionary<string, string>? user)
    {
        var err = RequireAuth(ctx, auth, out user);
        if (err is not null) return err;
        if (user!["role"] != role) return Results.Forbid();
        return null;
    }
}
