using System.Security.Cryptography;
using BCrypt.Net;

namespace InventoryWastePredictor.Api.Services;

public class AuthService
{
    // Credentials loaded from environment variables; fall back to demo values.
    // Set ADMIN_PASSWORD and VIEWER_PASSWORD env vars before any non-local deployment.
    private static readonly Dictionary<string, (string Hash, string Role)> Users;

    private static readonly int SessionExpirySeconds =
        int.TryParse(Environment.GetEnvironmentVariable("SESSION_EXPIRY_SECONDS"), out var s) ? s : 28800;

    static AuthService()
    {
        var adminPw  = Environment.GetEnvironmentVariable("ADMIN_PASSWORD")  ?? "admin";
        var viewerPw = Environment.GetEnvironmentVariable("VIEWER_PASSWORD") ?? "viewer";

        Users = new()
        {
            ["Admin"]  = (BCrypt.Net.BCrypt.HashPassword(adminPw),  "Manager"),
            ["Viewer"] = (BCrypt.Net.BCrypt.HashPassword(viewerPw), "User"),
        };
    }

    private readonly Dictionary<string, (string Username, string Role, long Expires)> _sessions = new();

    public Dictionary<string, string> Login(string username, string password)
    {
        if (!Users.TryGetValue(username, out var user) ||
            !BCrypt.Net.BCrypt.Verify(password, user.Hash))
            throw new InvalidOperationException("Invalid username or password.");

        var token   = Guid.NewGuid().ToString();
        var expires = DateTimeOffset.UtcNow.ToUnixTimeSeconds() + SessionExpirySeconds;
        _sessions[token] = (username, user.Role, expires);

        return new Dictionary<string, string>
        {
            ["token"]    = token,
            ["username"] = username,
            ["role"]     = user.Role,
        };
    }

    public Dictionary<string, string> GetCurrentUser(string token)
    {
        if (!_sessions.TryGetValue(token, out var session))
            throw new InvalidOperationException("Invalid or expired session token.");

        if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > session.Expires)
        {
            _sessions.Remove(token);
            throw new InvalidOperationException("Session expired. Please log in again.");
        }

        return new Dictionary<string, string>
        {
            ["username"] = session.Username,
            ["role"]     = session.Role,
        };
    }

    public void Logout(string token) => _sessions.Remove(token);
}
