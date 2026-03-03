from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from src.api.dependencies import require_auth, require_role
from src.services.intake_service import get_inventory_by_date, update_intake_record

router = APIRouter()


class InventoryItem(BaseModel):
    item_id: str
    name: str
    category: str
    units: int
    delivery_date: str


class InventoryListResponse(BaseModel):
    restaurant_id: str
    from_date: str
    to_date: str
    total_items: int
    total_units: int
    items: list[InventoryItem]


class EditItemRequest(BaseModel):
    name: str
    category: str
    units: int


@router.get("/", response_model=InventoryListResponse)
def list_inventory(
    restaurant_id: str = Query(...),
    from_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    to_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    user=Depends(require_auth),
):
    data = get_inventory_by_date(restaurant_id, from_date, to_date)
    return InventoryListResponse(
        restaurant_id=data["restaurant_id"],
        from_date=data["from"],
        to_date=data["to"],
        total_items=data["total_items"],
        total_units=data["total_units"],
        items=data["items"],
    )


@router.patch("/{item_id}", dependencies=[Depends(require_role("Manager"))])
def edit_inventory_item(
    item_id: str,
    body: EditItemRequest,
    restaurant_id: str = Query(...),
    delivery_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
):
    updated = update_intake_record(
        restaurant_id, item_id, delivery_date,
        {"name": body.name, "category": body.category, "units": body.units},
    )
    if not updated:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Record not found.")
    return {"message": "Record updated successfully."}
