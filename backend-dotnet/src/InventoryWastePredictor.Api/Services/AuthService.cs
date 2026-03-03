namespace InventoryWastePredictor.Api.Services;

public class AuthService
{
    private static readonly Dictionary<string, Dictionary<string, string>> Users = new()
    {
        ["Admin"]  = new() { ["password"] = "admin",  ["role"] = "Manager" },
        ["Viewer"] = new() { ["password"] = "viewer", ["role"] = "User" },
    };

    private readonly Dictionary<string, Dictionary<string, string>> _sessions = new();

    public Dictionary<string, string> Login(string username, string password)
    {
        if (!Users.TryGetValue(username, out var user) || user["password"] != password)
            throw new InvalidOperationException("Invalid username or password.");

        var token = Guid.NewGuid().ToString();
        var session = new Dictionary<string, string>
        {
            ["username"] = username,
            ["role"] = user["role"],
        };
        _sessions[token] = session;
        return new Dictionary<string, string>
        {
            ["token"]    = token,
            ["username"] = username,
            ["role"]     = user["role"],
        };
    }

    public Dictionary<string, string> GetCurrentUser(string token)
    {
        if (!_sessions.TryGetValue(token, out var session))
            throw new InvalidOperationException("Invalid or expired session token.");
        return session;
    }

    public void Logout(string token) => _sessions.Remove(token);
}
