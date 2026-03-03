import yaml
from pathlib import Path

_config = None

_DEFAULTS = {
    "app": {"name": "Inventory Waste Predictor", "version": "0.1.0", "debug": False},
    "api": {"host": "0.0.0.0", "port": 8000},
    "model": {
        "type": "heuristic",
        "retrain_interval_days": 7,
        "forecast_horizon_days": 30,
        "waste_threshold": 0.25,
    },
    "data": {
        "raw_path": "data/raw/",
        "processed_path": "data/processed/",
        "date_column": "date",
        "target_column": "waste_quantity",
    },
}


def get_config() -> dict:
    global _config
    if _config is None:
        config_path = Path(__file__).parents[2] / "config" / "settings.yaml"
        try:
            with open(config_path) as f:
                _config = yaml.safe_load(f)
        except FileNotFoundError:
            _config = _DEFAULTS
    return _config
