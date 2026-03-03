from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from src.services.auth_service import login, get_current_user, logout

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    token: str
    username: str
    role: str


class UserResponse(BaseModel):
    username: str
    role: str


@router.post("/login", response_model=AuthResponse)
def auth_login(body: LoginRequest):
    try:
        return login(body.username, body.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserResponse)
def auth_me(authorization: str = Header(...)):
    token = authorization.removeprefix("Bearer ").strip()
    try:
        return get_current_user(token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout")
def auth_logout(authorization: str = Header(...)):
    token = authorization.removeprefix("Bearer ").strip()
    logout(token)
    return {"message": "Logged out successfully."}
