"""
Monthly inventory intake service.
Returns all inventory received by a restaurant in a given month.
"""
from datetime import date, timedelta
from collections import defaultdict


# In-memory store simulating intake records.
# Replace with a real DB query when a database is wired up.
_INTAKE_RECORDS: list[dict] = [
    {"restaurant_id": "R001", "item_id": "SKU001", "name": "Whole Milk",      "category": "dairy",     "units": 80,  "delivery_date": "2026-03-01"},
    {"restaurant_id": "R001", "item_id": "SKU001", "name": "Whole Milk",      "category": "dairy",     "units": 70,  "delivery_date": "2026-03-08"},
    {"restaurant_id": "R001", "item_id": "SKU001", "name": "Whole Milk",      "category": "dairy",     "units": 50,  "delivery_date": "2026-03-15"},
    {"restaurant_id": "R001", "item_id": "SKU002", "name": "Sourdough Bread", "category": "bakery",    "units": 120, "delivery_date": "2026-03-02"},
    {"restaurant_id": "R001", "item_id": "SKU002", "name": "Sourdough Bread", "category": "bakery",    "units": 100, "delivery_date": "2026-03-16"},
    {"restaurant_id": "R001", "item_id": "SKU003", "name": "Tomatoes",        "category": "produce",   "units": 60,  "delivery_date": "2026-03-03"},
    {"restaurant_id": "R001", "item_id": "SKU003", "name": "Tomatoes",        "category": "produce",   "units": 55,  "delivery_date": "2026-03-17"},
    {"restaurant_id": "R001", "item_id": "SKU004", "name": "Chicken Breast",  "category": "meat",      "units": 40,  "delivery_date": "2026-02-10"},
    {"restaurant_id": "R002", "item_id": "SKU005", "name": "Olive Oil",       "category": "dry-goods", "units": 30,  "delivery_date": "2026-03-05"},
    {"restaurant_id": "R002", "item_id": "SKU006", "name": "Pasta",           "category": "dry-goods", "units": 90,  "delivery_date": "2026-03-05"},
    {"restaurant_id": "R002", "item_id": "SKU006", "name": "Pasta",           "category": "dry-goods", "units": 90,  "delivery_date": "2026-03-20"},
]


def get_monthly_intake(restaurant_id: str, month: str) -> dict:
    """
    Return aggregated inventory intake for a restaurant in a given month.

    Args:
        restaurant_id: Unique restaurant identifier.
        month: Target month in YYYY-MM format.

    Returns:
        Dict with total counts and per-item breakdown.

    Raises:
        ValueError: If month format is invalid.
    """
    try:
        year, mon = int(month[:4]), int(month[5:7])
    except (ValueError, IndexError):
        raise ValueError(f"Invalid month format '{month}'. Expected YYYY-MM.")

    records = [
        r for r in _INTAKE_RECORDS
        if r["restaurant_id"] == restaurant_id
        and r["delivery_date"].startswith(month)
    ]

    aggregated: dict[str, dict] = {}
    for r in records:
        key = r["item_id"]
        if key not in aggregated:
            aggregated[key] = {
                "item_id": key,
                "name": r["name"],
                "category": r["category"],
                "units_received": 0,
                "delivery_dates": [],
            }
        aggregated[key]["units_received"] += r["units"]
        aggregated[key]["delivery_dates"].append(r["delivery_date"])

    intake = sorted(aggregated.values(), key=lambda x: x["item_id"])

    return {
        "restaurant_id": restaurant_id,
        "month": month,
        "total_items_received": len(intake),
        "total_units": sum(i["units_received"] for i in intake),
        "intake": intake,
    }
