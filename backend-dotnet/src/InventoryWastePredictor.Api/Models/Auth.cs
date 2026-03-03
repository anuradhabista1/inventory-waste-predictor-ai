namespace InventoryWastePredictor.Api.Models;

public record LoginRequest(string Username, string Password);
public record AuthResponse(string Token, string Username, string Role);
public record UserResponse(string Username, string Role);
