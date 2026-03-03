from fastapi import APIRouter
from pydantic import BaseModel
from src.services.predictor import predict_waste

router = APIRouter()


class PredictRequest(BaseModel):
    item_id: str
    category: str
    current_stock: float
    avg_daily_sales: float
    days_to_expiry: int | None = None


class PredictResponse(BaseModel):
    item_id: str
    waste_risk_score: float
    predicted_waste_units: float
    risk_level: str
    recommendation: str


@router.post("/", response_model=PredictResponse)
def predict(request: PredictRequest):
    return predict_waste(request)
