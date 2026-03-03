# Inventory Waste Predictor AI — Claude Code Guide

## Project Overview
An AI-powered inventory waste prediction system that forecasts surplus, spoilage, and overstock using machine learning models.

## Tech Stack
- **Language:** Python 3.11+
- **ML Framework:** scikit-learn, XGBoost, Prophet
- **API:** FastAPI
- **Data:** pandas, numpy
- **Visualization:** plotly
- **Testing:** pytest

## Project Structure
```
inventory-waste-predictor-ai/
├── src/
│   ├── api/          # FastAPI routes and endpoints
│   ├── models/       # ML model definitions and training
│   ├── services/     # Business logic (prediction, ingestion)
│   └── utils/        # Helpers, logging, config loaders
├── data/
│   ├── raw/          # Raw input data (CSV, Excel)
│   └── processed/    # Cleaned and feature-engineered data
├── notebooks/        # Jupyter notebooks for EDA and prototyping
├── tests/            # pytest test suite
├── config/           # YAML config files
└── CLAUDE.md         # This file
```

## Key Commands
```bash
# Install dependencies
pip install -r requirements.txt

# Run API server
uvicorn src.api.main:app --reload

# Run tests
pytest tests/

# Train model
python src/models/train.py

# Run predictions
python src/services/predict.py
```

## Architecture
- **Ingestion:** Load inventory/sales data from CSV or API
- **Preprocessing:** Clean, normalize, engineer features (seasonality, turnover rate)
- **Model:** Time-series forecasting + classification for waste risk
- **API:** REST endpoints to serve predictions
- **Output:** Waste risk score, predicted surplus quantity, recommended actions

## Coding Conventions
- Use type hints on all functions
- Keep models in `src/models/`, business logic in `src/services/`
- All config via `config/settings.yaml`, loaded through `src/utils/config.py`
- Write tests for all service-layer functions
