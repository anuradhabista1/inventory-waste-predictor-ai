from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_items():
    # TODO: return tracked inventory items from data store
    return {"items": []}
