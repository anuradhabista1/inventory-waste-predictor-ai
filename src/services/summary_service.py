"""
Monthly consumption summary service.
Aggregates purchased quantities from intake records and merges with
consumed quantities entered by managers to calculate waste.
"""
from src.services.intake_service import _INTAKE_RECORDS

# In-memory consumption store: { (restaurant_id, item_id, month): units_consumed }
_CONSUMPTION: dict[tuple, int] = {
    ("R001", "SKU001", "2026-03"): 160,
    ("R001", "SKU002", "2026-03"): 190,
    ("R001", "SKU003", "2026-03"): 60,
    ("R001", "SKU004", "2026-02"): 35,
}

WASTE_THRESHOLDS = {"green": 15, "amber": 30}  # % boundaries


def _waste_level(waste_pct: float) -> str:
    if waste_pct <= WASTE_THRESHOLDS["green"]:
        return "green"
    if waste_pct <= WASTE_THRESHOLDS["amber"]:
        return "amber"
    return "red"


def get_monthly_summary(restaurant_id: str, month: str) -> dict:
    """
    Aggregate all purchased units for the month, merge with consumed
    quantities, and compute waste per item.
    """
    # Aggregate purchased per item_id for the month
    purchased: dict[str, dict] = {}
    for r in _INTAKE_RECORDS:
        if r["restaurant_id"] == restaurant_id and r["delivery_date"].startswith(month):
            key = r["item_id"]
            if key not in purchased:
                purchased[key] = {
                    "item_id": key,
                    "name": r["name"],
                    "category": r["category"],
                    "units_purchased": 0,
                }
            purchased[key]["units_purchased"] += r["units"]

    # Build summary rows
    items = []
    for item_id, p in sorted(purchased.items()):
        consumed = _CONSUMPTION.get((restaurant_id, item_id, month), 0)
        waste = max(p["units_purchased"] - consumed, 0)
        waste_pct = round((waste / p["units_purchased"]) * 100, 1) if p["units_purchased"] else 0.0
        items.append({
            "item_id": item_id,
            "name": p["name"],
            "category": p["category"],
            "units_purchased": p["units_purchased"],
            "units_consumed": consumed,
            "waste": waste,
            "waste_pct": waste_pct,
            "waste_level": _waste_level(waste_pct),
        })

    total_purchased = sum(i["units_purchased"] for i in items)
    total_consumed = sum(i["units_consumed"] for i in items)
    total_waste = max(total_purchased - total_consumed, 0)
    overall_waste_pct = round((total_waste / total_purchased) * 100, 1) if total_purchased else 0.0

    return {
        "restaurant_id": restaurant_id,
        "month": month,
        "items": items,
        "total_purchased": total_purchased,
        "total_consumed": total_consumed,
        "total_waste": total_waste,
        "overall_waste_pct": overall_waste_pct,
        "overall_waste_level": _waste_level(overall_waste_pct),
    }


def save_consumption(restaurant_id: str, month: str, entries: list[dict]) -> None:
    """
    Save or update consumed quantities for a month.
    Each entry: { item_id, units_consumed }
    """
    for entry in entries:
        _CONSUMPTION[(restaurant_id, entry["item_id"], month)] = entry["units_consumed"]
