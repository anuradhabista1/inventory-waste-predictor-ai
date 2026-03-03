import pytest
from src.services.intake_service import get_monthly_intake


def test_returns_correct_restaurant_and_month():
    result = get_monthly_intake("R001", "2026-03")
    assert result["restaurant_id"] == "R001"
    assert result["month"] == "2026-03"


def test_total_units_and_items():
    result = get_monthly_intake("R001", "2026-03")
    assert result["total_items_received"] == 3  # SKU001, SKU002, SKU003
    assert result["total_units"] == 535          # 200 + 220 + 115


def test_per_item_breakdown():
    result = get_monthly_intake("R001", "2026-03")
    milk = next(i for i in result["intake"] if i["item_id"] == "SKU001")
    assert milk["units_received"] == 200
    assert len(milk["delivery_dates"]) == 3
    assert milk["category"] == "dairy"


def test_excludes_other_months():
    result = get_monthly_intake("R001", "2026-02")
    # Only SKU004 was delivered in Feb for R001
    assert result["total_items_received"] == 1
    assert result["intake"][0]["item_id"] == "SKU004"


def test_excludes_other_restaurants():
    result = get_monthly_intake("R002", "2026-03")
    item_ids = {i["item_id"] for i in result["intake"]}
    assert "SKU001" not in item_ids
    assert "SKU005" in item_ids
    assert "SKU006" in item_ids


def test_empty_result_for_unknown_restaurant():
    result = get_monthly_intake("R999", "2026-03")
    assert result["total_items_received"] == 0
    assert result["total_units"] == 0
    assert result["intake"] == []


def test_invalid_month_raises():
    with pytest.raises(ValueError, match="Invalid month format"):
        get_monthly_intake("R001", "March-2026")
