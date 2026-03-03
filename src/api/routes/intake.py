from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from src.services.intake_service import get_monthly_intake, add_intake_records

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


class SubmitItem(BaseModel):
    item_id: str
    name: str
    category: str
    units: int = Field(gt=0)


class SubmitIntakeRequest(BaseModel):
    restaurant_id: str
    month: str = Field(pattern=r"^\d{4}-\d{2}$")
    delivery_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    items: list[SubmitItem] = Field(min_length=1)


class SubmitIntakeResponse(BaseModel):
    message: str
    restaurant_id: str
    month: str
    delivery_date: str
    items_added: int
    total_units: int


@router.get("/", response_model=IntakeResponse)
def monthly_intake(
    restaurant_id: str = Query(..., description="Restaurant identifier"),
    month: str = Query(..., description="Month in YYYY-MM format", pattern=r"^\d{4}-\d{2}$"),
):
    try:
        return get_monthly_intake(restaurant_id, month)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/", response_model=SubmitIntakeResponse)
def submit_intake(body: SubmitIntakeRequest):
    if not body.delivery_date.startswith(body.month):
        raise HTTPException(
            status_code=422,
            detail=f"Delivery date {body.delivery_date} is outside month {body.month}.",
        )
    add_intake_records(body)
    return SubmitIntakeResponse(
        message="Intake recorded successfully.",
        restaurant_id=body.restaurant_id,
        month=body.month,
        delivery_date=body.delivery_date,
        items_added=len(body.items),
        total_units=sum(i.units for i in body.items),
    )
