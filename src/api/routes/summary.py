from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from src.api.dependencies import require_auth, require_role
from src.services.summary_service import get_monthly_summary, save_consumption

router = APIRouter()


class SummaryItem(BaseModel):
    item_id: str
    name: str
    category: str
    units_purchased: int
    units_consumed: int
    waste: int
    waste_pct: float
    waste_level: str   # green | amber | red


class SummaryResponse(BaseModel):
    restaurant_id: str
    month: str
    items: list[SummaryItem]
    total_purchased: int
    total_consumed: int
    total_waste: int
    overall_waste_pct: float
    overall_waste_level: str


class ConsumptionEntry(BaseModel):
    item_id: str
    units_consumed: int = Field(ge=0)


class SaveConsumptionRequest(BaseModel):
    restaurant_id: str
    month: str = Field(pattern=r"^\d{4}-\d{2}$")
    entries: list[ConsumptionEntry] = Field(min_length=1)


@router.get("/", response_model=SummaryResponse)
def monthly_summary(
    restaurant_id: str = Query(...),
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$"),
    user=Depends(require_auth),
):
    return get_monthly_summary(restaurant_id, month)


@router.post("/", dependencies=[Depends(require_role("Manager"))])
def save_monthly_consumption(body: SaveConsumptionRequest):
    save_consumption(
        body.restaurant_id,
        body.month,
        [e.model_dump() for e in body.entries],
    )
    return {"message": "Consumption data saved successfully."}
