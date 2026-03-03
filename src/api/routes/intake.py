from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from src.services.intake_service import get_monthly_intake

router = APIRouter()


class IntakeItem(BaseModel):
    item_id: str
    name: str
    category: str
    units_received: int
    delivery_dates: list[str]


class IntakeResponse(BaseModel):
    restaurant_id: str
    month: str
    total_items_received: int
    total_units: int
    intake: list[IntakeItem]


@router.get("/", response_model=IntakeResponse)
def monthly_intake(
    restaurant_id: str = Query(..., description="Restaurant identifier"),
    month: str = Query(..., description="Month in YYYY-MM format", pattern=r"^\d{4}-\d{2}$"),
):
    try:
        return get_monthly_intake(restaurant_id, month)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
