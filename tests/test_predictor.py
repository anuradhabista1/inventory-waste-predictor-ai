import pytest
from src.services.predictor import predict_waste


class FakeRequest:
    def __init__(self, item_id, category, current_stock, avg_daily_sales, days_to_expiry=None):
        self.item_id = item_id
        self.category = category
        self.current_stock = current_stock
        self.avg_daily_sales = avg_daily_sales
        self.days_to_expiry = days_to_expiry


def test_high_waste_risk():
    req = FakeRequest("SKU001", "dairy", current_stock=100, avg_daily_sales=5, days_to_expiry=3)
    result = predict_waste(req)
    assert result["risk_level"] == "high"
    assert result["waste_risk_score"] >= 0.25


def test_low_waste_risk():
    req = FakeRequest("SKU002", "dry-goods", current_stock=10, avg_daily_sales=10, days_to_expiry=30)
    result = predict_waste(req)
    assert result["risk_level"] == "low"


def test_response_shape():
    req = FakeRequest("SKU003", "produce", current_stock=50, avg_daily_sales=8, days_to_expiry=7)
    result = predict_waste(req)
    assert "waste_risk_score" in result
    assert "predicted_waste_units" in result
    assert "recommendation" in result
