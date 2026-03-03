from fastapi import APIRouter, Depends
from src.api.dependencies import require_auth

router = APIRouter()


@router.get("/", dependencies=[Depends(require_auth)])
def list_items():
    # TODO: return tracked inventory items from data store
    return {"items": []}
