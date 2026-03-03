"""
FastAPI dependencies for authentication and role-based access control.
"""
from fastapi import Header, HTTPException
from src.services.auth_service import get_current_user


def require_auth(authorization: str = Header(...)):
    """Require any authenticated user. Returns current user dict."""
    token = authorization.removeprefix("Bearer ").strip()
    try:
        return get_current_user(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or missing auth token.")


def require_role(*roles: str):
    """Return a dependency that requires the user to have one of the given roles."""
    def dependency(authorization: str = Header(...)):
        token = authorization.removeprefix("Bearer ").strip()
        try:
            user = get_current_user(token)
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid or missing auth token.")
        if user["role"] not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role: {' or '.join(roles)}.",
            )
        return user
    return dependency
