# SKILLS.md

## Skills Map — Inventory Waste Predictor AI

This document maps the technical skills required to contribute to, maintain, and extend this project across all layers of the stack.

---

## 1. Backend (Python / FastAPI)

| Skill | Why It's Needed | Where Used |
|-------|----------------|-----------|
| **FastAPI** | Core API framework — routing, dependency injection, Pydantic integration | `src/api/` |
| **Pydantic v2** | Request/response validation on all endpoints | All `src/api/routes/` files |
| **Python type hints** | Mandatory on all functions (NFR-MNT-02) | Entire `src/` |
| **FastAPI Depends()** | RBAC enforcement via `require_auth` / `require_role` | `src/api/dependencies.py` |
| **Uvicorn / ASGI** | Running the development server | `uvicorn src.api.main:app --reload` |
| **PyYAML** | Config loading from `config/settings.yaml` | `src/utils/config.py` |
| **In-memory data patterns** | Current MVP uses Python dicts as data store | `src/services/*.py` |

---

## 2. AI / ML & Forecasting

| Skill | Why It's Needed | Where Used |
|-------|----------------|-----------|
| **Weighted Moving Average (WMA)** | Current forecast algorithm for next-month consumption | `src/services/report_service.py` |
| **Heuristic waste scoring** | Risk level (low/medium/high) based on waste % thresholds | `src/services/predictor.py` |
| **Prophet / XGBoost** *(Phase 3)* | Will replace WMA for higher-accuracy ML forecasting | Planned in `src/services/predictor.py` |
| **pandas / numpy** *(Phase 3)* | Feature engineering for ML models | `data/processed/`, `notebooks/` |
| **Jupyter Notebooks** | EDA and model prototyping | `notebooks/` |

---

## 3. Frontend (React / Vite)

| Skill | Why It's Needed | Where Used |
|-------|----------------|-----------|
| **React 18** | Component-based UI — hooks, context, state management | `frontend/src/` |
| **React Router v6** | Client-side routing with role-based `ProtectedRoute` | `frontend/src/App.jsx` |
| **React Context API** | Global auth state (token, role, user) | `frontend/src/context/AuthContext.jsx` |
| **Vite 7** | Build tool + dev proxy to backend `:8000` | `frontend/vite.config.js` |
| **Tailwind CSS v4** | All styling — no inline style objects except dynamic chart colours | All `.jsx` components |
| **Recharts** | Interactive charts with `ResponsiveContainer` — bought vs consumed, forecast | `BoughtVsConsumedChart.jsx`, `ForecastChart.jsx` |
| **Fetch API** | HTTP calls to backend — always with `Authorization: Bearer <token>` | All components making API calls |

---

## 4. Security

| Skill | Why It's Needed | Where Used |
|-------|----------------|-----------|
| **Session token auth (UUID v4)** | Current auth mechanism — issue token on login, validate per request | `src/services/auth_service.py` |
| **RBAC design** | Two-role system (Manager/User) enforced at API boundary | `src/api/dependencies.py` |
| **Environment variables / .env** | Secrets must never be hardcoded (SR-08) | `.env.example`, `os.environ` |
| **bcrypt / argon2** *(Phase 2)* | Password hashing before any non-local deployment (SR-03) | `src/services/auth_service.py` |
| **JWT with expiry** *(Phase 2)* | Replace UUID sessions with expiring tokens (SR-04) | `src/services/auth_service.py` |
| **CORS configuration** | Restrict allowed origins for production (SR-06) | `src/api/main.py` |
| **pip-audit / npm audit** | Dependency security scanning | CI / periodic manual runs |

---

## 5. Testing

| Skill | Why It's Needed | Where Used |
|-------|----------------|-----------|
| **pytest** | Full test suite — all service functions must have tests (TEST-01) | `tests/` |
| **Unit testing patterns** | Happy path, empty input, invalid input, boundary values (TEST-03) | `tests/test_*.py` |
| **Test naming convention** | `test_<function>_<scenario>()` (see REQUIREMENTS.md §10.2) | All test files |
| **No external deps in tests** | Tests must not call network or DB (TEST-04) | `tests/` |

---

## 6. DevOps & CI/CD

| Skill | Why It's Needed | Where Used |
|-------|----------------|-----------|
| **GitHub Actions** | CI runs on every push/PR to `main` — blocks merge on failure | `.github/workflows/ci.yml` |
| **Branch protection** | `main` is protected — PRs required, CI must pass (CI-05) | GitHub repo settings |
| **Git branching conventions** | `feature/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/` prefixes | All feature work |
| **Docker / Docker Compose** *(Phase 3)* | One-command local setup planned | Future `docker-compose.yml` |
| **PostgreSQL** *(Phase 2)* | Replace in-memory store for data persistence | Future `src/services/` + SQLAlchemy |
| **Redis** *(Phase 2)* | Replace in-memory session store | Future `src/services/auth_service.py` |

---

## 7. Documentation & Process

| Skill | Why It's Needed | Where Used |
|-------|----------------|-----------|
| **GitHub Issue authoring** | Issues must follow `feat/fix/docs: title` format with FR-* refs and acceptance criteria | All new work — see REQUIREMENTS.md §5 |
| **PR writing** | PRs must include Summary + Test Plan checklist and reference `closes #<n>` | All PRs — see REQUIREMENTS.md §5.3 |
| **Feature design docs** | New features should be designed using the §12.1 template before implementation | Design phase |
| **REQUIREMENTS.md literacy** | Canonical source of truth — must be read before generating any design output | All contributors |
| **SECURITY.md literacy** | Security baseline — all new endpoints and features must comply | All contributors |

---

## 8. Phase Roadmap Skills

Skills not yet needed but required as the project scales:

| Phase | Skill | Reason |
|-------|-------|--------|
| Phase 2 | SQLAlchemy ORM | Migrate in-memory stores to PostgreSQL |
| Phase 2 | Alembic migrations | Schema versioning for PostgreSQL |
| Phase 2 | Redis client (redis-py) | Persistent session management |
| Phase 3 | Prophet / XGBoost | Replace WMA with real ML forecasting |
| Phase 3 | Docker / Docker Compose | Containerised local + production setup |
| Phase 4 | Multi-tenancy design | Multi-restaurant admin panel |
| Phase 4 | WebSockets or SSE | Real-time waste alerts |

---

## Skill Onboarding Checklist

For a new contributor to be productive on this project:

- [ ] Read `REQUIREMENTS.md` in full (canonical rules for all design and code decisions)
- [ ] Read `SECURITY.md` (understand current limitations and enforcement points)
- [ ] Read `ARCHITECTURE.md` (system structure, data flows, RBAC flow)
- [ ] Run backend: `pip install -r requirements.txt && uvicorn src.api.main:app --reload`
- [ ] Run frontend: `cd frontend && npm install && npm run dev`
- [ ] Run tests: `pytest tests/ -v` (all must pass before any PR)
- [ ] Understand the two-role system: Manager (read+write) vs User (read-only)
- [ ] Understand that business logic lives in `src/services/` — never in route handlers

