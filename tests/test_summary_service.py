import pytest
from src.services.summary_service import get_monthly_summary, save_consumption


def test_summary_returns_correct_month():
    result = get_monthly_summary("R001", "2026-03")
    assert result["restaurant_id"] == "R001"
    assert result["month"] == "2026-03"
    assert len(result["items"]) == 3  # SKU001, SKU002, SKU003


def test_waste_calculated_correctly():
    result = get_monthly_summary("R001", "2026-03")
    milk = next(i for i in result["items"] if i["item_id"] == "SKU001")
    assert milk["units_purchased"] == 200
    assert milk["units_consumed"] == 160
    assert milk["waste"] == 40
    assert milk["waste_pct"] == 20.0
    assert milk["waste_level"] == "amber"


def test_totals_are_correct():
    result = get_monthly_summary("R001", "2026-03")
    assert result["total_purchased"] == 535
    assert result["total_consumed"] == 410
    assert result["total_waste"] == 125


def test_waste_level_green():
    result = get_monthly_summary("R001", "2026-03")
    bread = next(i for i in result["items"] if i["item_id"] == "SKU002")
    assert bread["waste_level"] == "green"


def test_waste_level_red():
    result = get_monthly_summary("R001", "2026-03")
    tomatoes = next(i for i in result["items"] if i["item_id"] == "SKU003")
    assert tomatoes["waste_level"] == "red"


def test_save_consumption_updates_waste():
    save_consumption("R001", "2026-03", [{"item_id": "SKU001", "units_consumed": 195}])
    result = get_monthly_summary("R001", "2026-03")
    milk = next(i for i in result["items"] if i["item_id"] == "SKU001")
    assert milk["units_consumed"] == 195
    assert milk["waste"] == 5
    assert milk["waste_level"] == "green"


def test_empty_month_returns_no_items():
    result = get_monthly_summary("R001", "2020-01")
    assert result["items"] == []
    assert result["total_purchased"] == 0
    assert result["total_waste"] == 0
