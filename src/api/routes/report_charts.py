from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from src.api.dependencies import require_auth
from src.services.report_service import get_history, get_forecast

router = APIRouter()


class ItemSeries(BaseModel):
    item_id: str
    name: str
    category: str
    purchased: list[int]
    consumed: list[int]


class HistoryResponse(BaseModel):
    restaurant_id: str
    months: list[str]
    series: list[ItemSeries]


class ForecastItem(BaseModel):
    item_id: str
    name: str
    category: str
    predicted_consumption: int
    confidence_low: int
    confidence_high: int


class ForecastResponse(BaseModel):
    restaurant_id: str
    forecast_month: str
    forecasts: list[ForecastItem]


@router.get("/history", response_model=HistoryResponse)
def history(
    restaurant_id: str = Query(...),
    months: int = Query(6, ge=2, le=12),
    user=Depends(require_auth),
):
    return get_history(restaurant_id, months)


@router.get("/forecast", response_model=ForecastResponse)
def forecast(
    restaurant_id: str = Query(...),
    user=Depends(require_auth),
):
    return get_forecast(restaurant_id)
