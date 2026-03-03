from fastapi import APIRouter, Depends
from pydantic import BaseModel
from src.api.dependencies import require_auth
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


@router.post("/", response_model=PredictResponse, dependencies=[Depends(require_auth)])
def predict(request: PredictRequest):
    return predict_waste(request)
