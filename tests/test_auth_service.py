import pytest
from src.services.auth_service import login, get_current_user, logout


def test_valid_login():
    result = login("Admin", "admin")
    assert result["username"] == "Admin"
    assert result["role"] == "Manager"
    assert "token" in result


def test_invalid_password():
    with pytest.raises(ValueError, match="Invalid username or password"):
        login("Admin", "wrongpassword")


def test_invalid_username():
    with pytest.raises(ValueError, match="Invalid username or password"):
        login("unknown", "admin")


def test_get_current_user():
    result = login("Admin", "admin")
    user = get_current_user(result["token"])
    assert user["username"] == "Admin"
    assert user["role"] == "Manager"


def test_invalid_token():
    with pytest.raises(ValueError, match="Invalid or expired session token"):
        get_current_user("not-a-real-token")


def test_logout_invalidates_token():
    result = login("Admin", "admin")
    logout(result["token"])
    with pytest.raises(ValueError, match="Invalid or expired session token"):
        get_current_user(result["token"])
