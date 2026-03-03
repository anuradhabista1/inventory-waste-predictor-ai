import yaml
from pathlib import Path

_config = None


def get_config() -> dict:
    global _config
    if _config is None:
        config_path = Path(__file__).parents[2] / "config" / "settings.yaml"
        with open(config_path) as f:
            _config = yaml.safe_load(f)
    return _config
