import pytest
from src.services.report_service import (
    _next_month,
    _weighted_moving_average,
    get_history,
    get_forecast,
)


# ── _next_month ──────────────────────────────────────────────────────────────

def test_next_month_mid_year():
    assert _next_month("2026-03") == "2026-04"


def test_next_month_year_rollover():
    assert _next_month("2025-12") == "2026-01"


# ── _weighted_moving_average ─────────────────────────────────────────────────

def test_wma_all_zeros_returns_zero():
    assert _weighted_moving_average([0, 0, 0]) == 0.0


def test_wma_single_nonzero():
    assert _weighted_moving_average([0, 0, 50]) == 50.0


def test_wma_equal_weights_equals_average():
    result = _weighted_moving_average([10, 20, 30], weights=[1, 1, 1])
    assert result == pytest.approx(20.0, abs=0.5)


def test_wma_higher_weight_on_recent():
    # Last value (100) should dominate with weights [1, 1, 10]
    result = _weighted_moving_average([10, 10, 100], weights=[1, 1, 10])
    assert result > 80


# ── get_history ───────────────────────────────────────────────────────────────

def test_history_structure():
    result = get_history("R001", months=6)
    assert "restaurant_id" in result
    assert "months" in result
    assert "series" in result
    assert result["restaurant_id"] == "R001"
    assert len(result["months"]) == 6


def test_history_series_fields():
    result = get_history("R001", months=6)
    assert len(result["series"]) > 0
    for s in result["series"]:
        assert "item_id" in s
        assert "name" in s
        assert "category" in s
        assert "purchased" in s
        assert "consumed" in s
        assert len(s["purchased"]) == 6
        assert len(s["consumed"]) == 6


def test_history_consumed_le_purchased():
    result = get_history("R001", months=6)
    for s in result["series"]:
        for p, c in zip(s["purchased"], s["consumed"]):
            # consumed should never exceed purchased for any month
            assert c <= p, f"{s['item_id']}: consumed {c} > purchased {p}"


def test_history_no_data_restaurant():
    result = get_history("RXXX", months=6)
    assert result["series"] == []
    assert len(result["months"]) == 6


# ── get_forecast ──────────────────────────────────────────────────────────────

def test_forecast_structure():
    result = get_forecast("R001")
    assert "restaurant_id" in result
    assert "forecast_month" in result
    assert "forecasts" in result
    assert result["restaurant_id"] == "R001"


def test_forecast_month_is_next_month():
    history = get_history("R001", months=6)
    last_month = history["months"][-1]
    expected_next = _next_month(last_month)
    result = get_forecast("R001")
    assert result["forecast_month"] == expected_next


def test_forecast_item_fields():
    result = get_forecast("R001")
    assert len(result["forecasts"]) > 0
    for f in result["forecasts"]:
        assert "item_id" in f
        assert "name" in f
        assert "predicted_consumption" in f
        assert "confidence_low" in f
        assert "confidence_high" in f


def test_forecast_confidence_band_valid():
    result = get_forecast("R001")
    for f in result["forecasts"]:
        assert f["confidence_low"] >= 0
        assert f["confidence_high"] >= f["confidence_low"]
        assert f["predicted_consumption"] >= f["confidence_low"]
        assert f["predicted_consumption"] <= f["confidence_high"]


def test_forecast_predicted_positive():
    result = get_forecast("R001")
    for f in result["forecasts"]:
        assert f["predicted_consumption"] >= 0
