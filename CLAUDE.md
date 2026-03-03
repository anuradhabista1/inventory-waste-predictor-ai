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

---

## Authoritative Requirements Source
The file `REQUIREMENTS.md` is the canonical source of structured requirement rules and design document generation standards.
Before performing any of the following tasks, you MUST:
* Read `REQUIREMENTS.md` in full
* Treat it as binding specification
* Follow all generation rules defined in that file
* Do not contradict or bypass its constraints

This applies to:
* GitHub issue → design document generation
* Architecture generation
* Security design output
* Workflow design
* CI/CD automation
* Prompt distribution features
* Policy design

If `REQUIREMENTS.md` conflicts with any other instruction in this repository, `REQUIREMENTS.md` takes precedence unless explicitly overridden in writing in this file.

---

## Mandatory Pre-Execution Rule
Before generating structured design documentation:
1. Load `REQUIREMENTS.md`
2. Identify required output structure
3. Apply all strict generation rules
4. Apply security baseline controls
5. Produce a complete document

Do not skip this step.

---

## File Hierarchy and Precedence
Order of authority:
1. REQUIREMENTS.md (generation rules + design template)
2. SECURITY.md (security constraints and policies)
3. ARCHITECTURE.md (system structure and conventions)
4. CLAUDE.md (behavioral execution instructions)

If ambiguity exists:
* Security constraints override architectural convenience.
* Requirements override stylistic preferences.
