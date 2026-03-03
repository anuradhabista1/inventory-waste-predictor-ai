using FluentAssertions;
using InventoryWastePredictor.Api.Services;
using Xunit;

namespace InventoryWastePredictor.Tests;

public class AuthServiceTests
{
    private static AuthService NewService() => new AuthService();

    [Fact]
    public void ValidLogin_ReturnsTokenAndUser()
    {
        var auth   = NewService();
        var result = auth.Login("Admin", "admin");

        result["username"].Should().Be("Admin");
        result["role"].Should().Be("Manager");
        result.Should().ContainKey("token");
        result["token"].Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void InvalidPassword_ThrowsInvalidOperationException()
    {
        var auth = NewService();
        var act  = () => auth.Login("Admin", "wrongpassword");
        act.Should().Throw<InvalidOperationException>().WithMessage("*Invalid username or password*");
    }

    [Fact]
    public void InvalidUsername_ThrowsInvalidOperationException()
    {
        var auth = NewService();
        var act  = () => auth.Login("unknown", "admin");
        act.Should().Throw<InvalidOperationException>().WithMessage("*Invalid username or password*");
    }

    [Fact]
    public void GetCurrentUser_ReturnsCorrectUser()
    {
        var auth   = NewService();
        var login  = auth.Login("Admin", "admin");
        var user   = auth.GetCurrentUser(login["token"]);

        user["username"].Should().Be("Admin");
        user["role"].Should().Be("Manager");
    }

    [Fact]
    public void InvalidToken_ThrowsInvalidOperationException()
    {
        var auth = NewService();
        var act  = () => auth.GetCurrentUser("not-a-real-token");
        act.Should().Throw<InvalidOperationException>().WithMessage("*Invalid or expired session token*");
    }

    [Fact]
    public void Logout_InvalidatesToken()
    {
        var auth  = NewService();
        var login = auth.Login("Admin", "admin");
        auth.Logout(login["token"]);

        var act = () => auth.GetCurrentUser(login["token"]);
        act.Should().Throw<InvalidOperationException>().WithMessage("*Invalid or expired session token*");
    }
}
