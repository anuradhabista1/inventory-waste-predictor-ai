"""
Auth service — credentials loaded from environment variables, passwords verified with bcrypt.
"""
import os
import time
import uuid
import bcrypt

# Session expiry in seconds (default 8 hours)
_SESSION_EXPIRY = int(os.environ.get("SESSION_EXPIRY_SECONDS", 28800))

# Load credentials from env vars; fall back to demo values if not set.
# In production, always set ADMIN_PASSWORD and VIEWER_PASSWORD env vars.
def _hash(pw: str) -> bytes:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt())

USERS: dict[str, dict] = {
    "Admin":  {"hash": _hash(os.environ.get("ADMIN_PASSWORD",  "admin")),  "role": "Manager"},
    "Viewer": {"hash": _hash(os.environ.get("VIEWER_PASSWORD", "viewer")), "role": "User"},
}

# In-memory token store: { token: { username, role, expires } }
_SESSIONS: dict[str, dict] = {}


def login(username: str, password: str) -> dict:
    """
    Validate credentials with bcrypt and return a session token.
    Raises ValueError on invalid credentials.
    """
    user = USERS.get(username)
    if not user or not bcrypt.checkpw(password.encode(), user["hash"]):
        raise ValueError("Invalid username or password.")

    token = str(uuid.uuid4())
    _SESSIONS[token] = {
        "username": username,
        "role": user["role"],
        "expires": time.time() + _SESSION_EXPIRY,
    }
    return {"token": token, "username": username, "role": user["role"]}


def get_current_user(token: str) -> dict:
    """
    Look up a session token, check expiry, and return the user info.
    Raises ValueError if token is invalid or expired.
    """
    session = _SESSIONS.get(token)
    if not session:
        raise ValueError("Invalid or expired session token.")
    if time.time() > session["expires"]:
        _SESSIONS.pop(token, None)
        raise ValueError("Session expired. Please log in again.")
    return {"username": session["username"], "role": session["role"]}


def logout(token: str) -> None:
    _SESSIONS.pop(token, None)
