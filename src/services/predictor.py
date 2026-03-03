from src.utils.config import get_config

config = get_config()
WASTE_THRESHOLD = config["model"]["waste_threshold"]


def predict_waste(request) -> dict:
    """
    Core prediction logic. Returns waste risk score and recommendation.
    Replace the heuristic below with a trained ML model.
    """
    stock = request.current_stock
    daily_sales = request.avg_daily_sales if request.avg_daily_sales > 0 else 0.01
    days_to_expiry = request.days_to_expiry

    days_of_stock = stock / daily_sales
    expiry_factor = (days_of_stock / days_to_expiry) if days_to_expiry else 0.5
    waste_risk_score = min(round(expiry_factor * 0.6, 2), 1.0)
    predicted_waste_units = round(max(stock - daily_sales * (days_to_expiry or 30), 0), 2)

    if waste_risk_score >= WASTE_THRESHOLD:
        risk_level = "high"
        recommendation = "Discount or redistribute stock immediately."
    elif waste_risk_score >= 0.1:
        risk_level = "medium"
        recommendation = "Monitor closely and consider promotions."
    else:
        risk_level = "low"
        recommendation = "No action needed."

    return {
        "item_id": request.item_id,
        "waste_risk_score": waste_risk_score,
        "predicted_waste_units": predicted_waste_units,
        "risk_level": risk_level,
        "recommendation": recommendation,
    }
