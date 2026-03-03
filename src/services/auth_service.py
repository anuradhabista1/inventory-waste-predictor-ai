"""
Auth service — hardcoded user store, easy to replace with a real DB.
"""
import uuid

# User store: extend this dict to add more users/roles
USERS = {
    "Admin":  {"password": "admin",  "role": "Manager"},
    "Viewer": {"password": "viewer", "role": "User"},
}

# In-memory token store: { token: { username, role } }
_SESSIONS: dict[str, dict] = {}


def login(username: str, password: str) -> dict:
    """
    Validate credentials and return a session token.
    Raises ValueError on invalid credentials.
    """
    user = USERS.get(username)
    if not user or user["password"] != password:
        raise ValueError("Invalid username or password.")

    token = str(uuid.uuid4())
    _SESSIONS[token] = {"username": username, "role": user["role"]}
    return {"token": token, "username": username, "role": user["role"]}


def get_current_user(token: str) -> dict:
    """
    Look up a session token and return the user info.
    Raises ValueError if token is invalid or expired.
    """
    session = _SESSIONS.get(token)
    if not session:
        raise ValueError("Invalid or expired session token.")
    return session


def logout(token: str) -> None:
    _SESSIONS.pop(token, None)
