# Architecture

## Overview

**Inventory Waste Predictor AI** is a full-stack web application that helps restaurant operators track inventory intake, monitor monthly consumption, predict food waste, and visualise trends. It consists of a **FastAPI** backend and a **React + Vite** frontend.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│              React + Vite (localhost:5173)                  │
│   Login │ Inventory List │ Intake Form │ Monthly Summary    │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP (proxied by Vite dev server)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               FastAPI Backend (localhost:8000)              │
│  /auth  │  /inventory/intake  │  /inventory/list            │
│  /inventory/summary  │  /inventory/report  │  /predict      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            In-Memory Data Store (MVP)                       │
│   _INTAKE_RECORDS  │  _CONSUMPTION  │  _SESSIONS            │
│          → PostgreSQL (planned)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | [FastAPI](https://fastapi.tiangolo.com/) 0.x |
| Runtime | Python 3.11+ |
| Validation | Pydantic v2 |
| Server | Uvicorn (ASGI) |
| Config | PyYAML (`config/settings.yaml`) |
| Testing | pytest |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Charts | Recharts |
| HTTP | Native `fetch` API |

### Planned / Future
| Purpose | Technology |
|---------|-----------|
| Database | PostgreSQL + SQLAlchemy |
| ML forecasting | Prophet / XGBoost |
| Cache / sessions | Redis |
| Containerisation | Docker + Docker Compose |
| CI/CD | GitHub Actions (already wired) |

---

## Directory Structure

```
inventory-waste-predictor-ai/
│
├── src/                        # Backend source
│   ├── api/
│   │   ├── main.py             # FastAPI app, CORS, router registration
│   │   ├── dependencies.py     # require_auth / require_role RBAC guards
│   │   └── routes/
│   │       ├── auth.py         # POST /auth/login, GET /auth/me, POST /auth/logout
│   │       ├── intake.py       # GET/POST /inventory/intake
│   │       ├── inventory.py    # GET /inventory/list, PATCH /inventory/list/{id}
│   │       ├── summary.py      # GET/POST /inventory/summary
│   │       ├── report_charts.py# GET /inventory/report/history & /forecast
│   │       ├── predict.py      # POST /predict
│   │       ├── items.py        # GET /items (stub)
│   │       └── report.py       # GET /report (stub)
│   ├── services/
│   │   ├── auth_service.py     # User store, session token management
│   │   ├── intake_service.py   # Intake CRUD, in-memory records
│   │   ├── summary_service.py  # Consumption tracking, waste calculation
│   │   ├── report_service.py   # History aggregation, WMA forecast
│   │   └── predictor.py        # Heuristic waste risk scoring
│   └── utils/
│       └── config.py           # YAML config loader with defaults fallback
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── App.jsx             # Routes, layout, header
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state, localStorage persistence
│   │   └── components/
│   │       ├── LoginPage.jsx
│   │       ├── ProtectedRoute.jsx
│   │       ├── InventoryList.jsx      # Main landing (all users)
│   │       ├── InventoryTable.jsx
│   │       ├── DateFilter.jsx
│   │       ├── EditItemModal.jsx      # Manager only
│   │       ├── IntakeForm.jsx         # Manager only
│   │       ├── ItemRow.jsx
│   │       ├── SuccessSummary.jsx
│   │       ├── MonthlySummary.jsx     # Purchased vs consumed + waste %
│   │       ├── ReportSection.jsx      # Collapsible charts panel
│   │       ├── BoughtVsConsumedChart.jsx
│   │       └── ForecastChart.jsx
│   └── vite.config.js          # Tailwind plugin + proxy to :8000
│
├── tests/                      # pytest test suite
│   ├── test_auth_service.py
│   ├── test_intake_service.py
│   ├── test_predictor.py
│   ├── test_summary_service.py
│   └── test_report_service.py
│
├── config/
│   └── settings.yaml           # App + model configuration
│
├── data/
│   ├── raw/                    # Raw intake CSVs (gitignored)
│   └── processed/              # Feature-engineered data (gitignored)
│
├── notebooks/                  # Jupyter EDA / model development
├── .github/workflows/ci.yml    # GitHub Actions CI
├── requirements.txt
└── CLAUDE.md                   # Claude Code project instructions
```

---

## API Endpoints

### Auth
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Returns session token |
| GET | `/auth/me` | Any | Returns current user info |
| POST | `/auth/logout` | Any | Invalidates session token |

### Inventory Intake
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/inventory/intake/` | Any | Monthly intake summary for a restaurant |
| POST | `/inventory/intake/` | Manager | Submit new delivery records |

### Inventory List
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/inventory/list/` | Any | Inventory records with date filter |
| PATCH | `/inventory/list/{item_id}` | Manager | Update a record |

### Monthly Summary
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/inventory/summary/` | Any | Purchased vs consumed with waste % |
| POST | `/inventory/summary/` | Manager | Save consumed quantities |

### Reports
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/inventory/report/history` | Any | 6-month bought vs consumed per item |
| GET | `/inventory/report/forecast` | Any | Next-month WMA consumption forecast |

### Prediction
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/predict` | Any | Heuristic waste risk score for an item |

---

## Data Flow

### Intake Submission (Manager)
```
Manager fills IntakeForm
  → POST /inventory/intake/
    → require_role("Manager") guard
      → add_intake_records() appends to _INTAKE_RECORDS
        → 200 OK with items_added count
```

### Monthly Summary View
```
User opens Monthly Summary page
  → GET /inventory/summary/?restaurant_id=R001&month=2026-03
    → require_auth() guard
      → get_monthly_summary() joins _INTAKE_RECORDS + _CONSUMPTION
        → returns purchased, consumed, waste %, waste level per item
          → MonthlySummary.jsx renders table + live waste recalculation
```

### Forecast Generation
```
User expands Reports & Forecast panel
  → GET /inventory/report/history  (parallel)
  → GET /inventory/report/forecast (parallel)
    → get_history() aggregates last 6 months from _INTAKE_RECORDS + _CONSUMPTION
    → get_forecast() applies weighted moving average [1,1,2,2,3,3] per item
      → ForecastChart.jsx renders ComposedChart with confidence bands
```

---

## Authentication & RBAC Flow

```
Browser                    Frontend                  Backend
  │                            │                        │
  │── enter credentials ──────>│                        │
  │                            │── POST /auth/login ───>│
  │                            │                   login()
  │                            │                   UUID token → _SESSIONS
  │                            │<── { token, role } ────│
  │                      localStorage.setItem()         │
  │                            │                        │
  │── navigate to /summary ───>│                        │
  │                       ProtectedRoute check          │
  │                            │── GET /inventory/summary/ ──>│
  │                            │   Authorization: Bearer <token>
  │                            │                   require_auth()
  │                            │                   _SESSIONS lookup
  │                            │<── 200 summary data ───│
  │<── renders table ──────────│                        │
```

---

## Waste Calculation Logic

### Per-item waste
```
waste_units = units_purchased − units_consumed
waste_pct   = (waste_units / units_purchased) × 100
```

### Waste levels (colour coding)
| Level | Threshold | Colour |
|-------|-----------|--------|
| Green | waste_pct ≤ 15% | Acceptable |
| Amber | 15% < waste_pct ≤ 30% | Monitor |
| Red | waste_pct > 30% | Action required |

### Forecast (Weighted Moving Average)
```python
weights = [1, 1, 2, 2, 3, 3]   # last 6 months, oldest → newest
predicted = Σ(consumed[i] × weights[i]) / Σ(weights[i] where consumed[i] > 0)
confidence_low  = predicted × 0.88
confidence_high = predicted × 1.12
```

---

## Frontend Routing

| Path | Component | Access |
|------|-----------|--------|
| `/login` | `LoginPage` | Public |
| `/` | `InventoryList` | Any authenticated |
| `/intake` | `IntakeForm` | Manager only |
| `/summary` | `MonthlySummary` + `ReportSection` | Any authenticated |

---

## CI/CD Pipeline

```
git push / PR to main
  → GitHub Actions (ubuntu-latest, Python 3.11)
    → pip install -r requirements.txt
      → pytest tests/ -v
        → pass → merge allowed
        → fail → PR blocked
```

Workflow file: `.github/workflows/ci.yml`

---

## Upgrade Roadmap

| Phase | Change | Impact |
|-------|--------|--------|
| **Phase 2** | Replace in-memory stores with PostgreSQL | Data persistence across restarts |
| **Phase 2** | Hash passwords with bcrypt | Security hardening |
| **Phase 2** | JWT tokens with expiry | Proper session management |
| **Phase 3** | Swap WMA forecast with Prophet/XGBoost | Higher forecast accuracy |
| **Phase 3** | Docker + Docker Compose | One-command local setup |
| **Phase 4** | Multi-restaurant admin panel | Scalability |
| **Phase 4** | Real-time alerts for high waste items | Proactive waste reduction |
