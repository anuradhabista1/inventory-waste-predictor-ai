# Requirements & Design Generation Standards

> **Authority:** This file is the canonical source of truth for all structured design documentation, generation rules, and output standards in this repository.
> Per `CLAUDE.md`, this file takes precedence over all other documents except explicit in-file overrides.

---

## Table of Contents

1. [Project Requirements](#1-project-requirements)
2. [Functional Requirements](#2-functional-requirements)
3. [Non-Functional Requirements](#3-non-functional-requirements)
4. [Design Document Generation Rules](#4-design-document-generation-rules)
5. [GitHub Issue Standards](#5-github-issue-standards)
6. [Architecture Generation Rules](#6-architecture-generation-rules)
7. [Security Design Rules](#7-security-design-rules)
8. [API Design Rules](#8-api-design-rules)
9. [Frontend Design Rules](#9-frontend-design-rules)
10. [Testing Requirements](#10-testing-requirements)
11. [CI/CD Requirements](#11-cicd-requirements)
12. [Output Templates](#12-output-templates)

---

## 1. Project Requirements

### 1.1 System Identity
- **Product:** Inventory Waste Predictor AI
- **Purpose:** Help restaurant operators reduce food waste by tracking inventory intake, consumption, and predicting future waste using AI/ML models
- **Primary Users:** Restaurant Managers (read + write), Restaurant Staff / Users (read-only)
- **Deployment Target:** Local → Cloud (phased)
- **Current Phase:** MVP (in-memory data store, heuristic prediction)

### 1.2 Core Capabilities (Must Have)
| ID | Capability | Status |
|----|-----------|--------|
| REQ-001 | Monthly inventory intake recording | ✅ Implemented |
| REQ-002 | Purchased vs consumed tracking with waste % | ✅ Implemented |
| REQ-003 | Role-based access control (Manager / User) | ✅ Implemented |
| REQ-004 | Inventory list view with date filter | ✅ Implemented |
| REQ-005 | Bought vs consumed trend charts (6 months) | ✅ Implemented |
| REQ-006 | AI consumption forecast (next month) | ✅ Implemented (WMA) |
| REQ-007 | Waste risk scoring per SKU | ✅ Implemented (heuristic) |
| REQ-008 | Persistent data store (PostgreSQL) | 🔲 Phase 2 |
| REQ-009 | ML-based forecast (Prophet / XGBoost) | 🔲 Phase 3 |
| REQ-010 | Multi-restaurant admin panel | 🔲 Phase 4 |

### 1.3 Constraints
- All backend code in Python 3.11+
- All frontend code in React 18 + Vite + Tailwind CSS
- No external paid services in MVP phase
- All endpoints must be authenticated (no public API routes except `/auth/login` and `/health`)
- Data validation must use Pydantic v2 models on all POST/PATCH endpoints

---

## 2. Functional Requirements

### 2.1 Authentication & Authorisation
- **FR-AUTH-01:** System MUST support username/password login returning a session token
- **FR-AUTH-02:** Session tokens MUST be validated on every protected request via `Authorization: Bearer <token>` header
- **FR-AUTH-03:** Two roles MUST exist: `Manager` and `User`
- **FR-AUTH-04:** Role enforcement MUST use FastAPI `Depends()` — never inline checks
- **FR-AUTH-05:** Logout MUST invalidate the token immediately

### 2.2 Inventory Intake
- **FR-INT-01:** Managers MUST be able to submit multi-item delivery records per date
- **FR-INT-02:** Intake records MUST include: `restaurant_id`, `item_id`, `name`, `category`, `units`, `delivery_date`
- **FR-INT-03:** Delivery date MUST fall within the declared month (validated server-side)
- **FR-INT-04:** All users MUST be able to view aggregated monthly intake

### 2.3 Monthly Summary
- **FR-SUM-01:** System MUST calculate `waste = units_purchased − units_consumed` per item
- **FR-SUM-02:** Waste percentage MUST be categorised: green (≤15%), amber (15–30%), red (>30%)
- **FR-SUM-03:** Managers MUST be able to edit consumed quantities and save
- **FR-SUM-04:** Live waste recalculation MUST occur client-side without a server round-trip

### 2.4 Reports & Forecast
- **FR-REP-01:** History endpoint MUST return last N months (default 6) of purchased and consumed per item
- **FR-REP-02:** Forecast endpoint MUST predict next month's consumption per item
- **FR-REP-03:** Forecast MUST include a confidence range (±12% of predicted value minimum)
- **FR-REP-04:** Charts MUST be interactive (item selector, tooltips, responsive)

### 2.5 Waste Prediction
- **FR-PRED-01:** Prediction endpoint MUST return `waste_risk_score`, `predicted_waste_units`, `risk_level`, `recommendation`
- **FR-PRED-02:** Risk levels MUST be: `low`, `medium`, `high`
- **FR-PRED-03:** Prediction logic MUST be replaceable (isolated in `src/services/predictor.py`)

---

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-PERF-01:** API responses MUST return within 500ms for all in-memory operations
- **NFR-PERF-02:** Frontend initial load MUST complete within 3 seconds on localhost

### 3.2 Reliability
- **NFR-REL-01:** All service-layer functions MUST have unit tests
- **NFR-REL-02:** CI pipeline MUST block merges on test failure
- **NFR-REL-03:** Config loading MUST fall back to defaults if `settings.yaml` is absent

### 3.3 Maintainability
- **NFR-MNT-01:** Business logic MUST live in `src/services/` — never in route handlers
- **NFR-MNT-02:** All functions MUST have Python type hints
- **NFR-MNT-03:** No magic numbers — all thresholds defined in `config/settings.yaml` or named constants
- **NFR-MNT-04:** Frontend state MUST be co-located with the component that owns it

### 3.4 Security
- **NFR-SEC-01:** Passwords MUST be hashed (bcrypt / argon2) before production deployment
- **NFR-SEC-02:** Secrets MUST be loaded from environment variables — never hardcoded
- **NFR-SEC-03:** CORS origins MUST be restricted to known domains in production
- **NFR-SEC-04:** See `SECURITY.md` for full security baseline

---

## 4. Design Document Generation Rules

> Apply these rules whenever generating any design document, architecture doc, feature spec, or structured output.

### 4.1 Mandatory Pre-Generation Checklist
Before producing any design output, confirm:
- [ ] `REQUIREMENTS.md` has been read in full
- [ ] Relevant functional requirements (FR-*) are identified
- [ ] Relevant non-functional requirements (NFR-*) are identified
- [ ] Security baseline from `SECURITY.md` has been applied
- [ ] Output matches the template for the document type (see §12)

### 4.2 Strict Generation Rules
| Rule | Description |
|------|-------------|
| **GR-01** | Every design document MUST have a header with: title, version, date, status |
| **GR-02** | Every new feature design MUST reference at least one FR-* requirement ID |
| **GR-03** | Every endpoint design MUST specify: method, path, auth role, request schema, response schema, error codes |
| **GR-04** | Every data model MUST include field names, types, constraints, and validation rules |
| **GR-05** | Security implications MUST be documented for any feature that touches auth, data storage, or external calls |
| **GR-06** | All diagrams MUST use ASCII art (no external image dependencies) |
| **GR-07** | All generated documents MUST include an "Open Questions" section if ambiguity exists |
| **GR-08** | Do not generate partial documents — produce the complete output or state explicitly what is missing |
| **GR-09** | Version bump rules: patch (0.0.x) for docs updates, minor (0.x.0) for new features, major (x.0.0) for breaking changes |
| **GR-10** | All requirement IDs (FR-*, NFR-*, REQ-*) MUST be traceable back to this file |

### 4.3 Prohibited Patterns
- Do NOT generate placeholder sections with "TBD" without flagging them explicitly
- Do NOT omit error handling design from API specifications
- Do NOT design features that bypass `require_auth` or `require_role` guards
- Do NOT introduce new data models without defining their validation rules
- Do NOT design frontend routes without specifying their access role

---

## 5. GitHub Issue Standards

### 5.1 Issue Creation Rules
Every GitHub issue MUST contain:
1. **Title:** `<type>: <short description>` — types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
2. **Description:** What problem this solves and why it is needed
3. **Requirement reference:** Which FR-* or REQ-* IDs this addresses
4. **Acceptance criteria:** Bulleted checklist of verifiable done conditions
5. **Implementation notes:** Key technical decisions or constraints (optional but recommended)

### 5.2 Issue Types and Scope
| Type | Scope | Branch prefix |
|------|-------|---------------|
| `feat` | New user-facing functionality | `feature/` |
| `fix` | Bug fix | `fix/` |
| `docs` | Documentation only | `docs/` |
| `refactor` | Code restructure, no behaviour change | `refactor/` |
| `test` | Test coverage improvement | `test/` |
| `chore` | Tooling, CI, dependencies | `chore/` |

### 5.3 Issue → PR Traceability
- Branch MUST be named `<prefix>/<short-slug>` matching the issue type
- PR title MUST include `(closes #<issue-number>)`
- PR body MUST include a Summary section and a Test Plan checklist

---

## 6. Architecture Generation Rules

When generating or updating `ARCHITECTURE.md` or any architecture diagram:

- **AR-01:** MUST include an ASCII system context diagram showing browser → API → data store
- **AR-02:** MUST list all API routers registered in `src/api/main.py` with their URL prefixes
- **AR-03:** MUST reflect the actual directory structure — do not describe planned structure as current
- **AR-04:** MUST separate "current state" from "planned/roadmap" clearly
- **AR-05:** MUST include the data flow for at least: intake submission, summary view, forecast generation
- **AR-06:** MUST document the RBAC enforcement points (which routes use `require_auth` vs `require_role`)
- **AR-07:** MUST include a technology decision table with current vs planned stack

---

## 7. Security Design Rules

When designing or reviewing any security-related feature:

- **SR-01:** Every new endpoint MUST declare its authentication requirement explicitly
- **SR-02:** Any feature storing user data MUST document data retention and access controls
- **SR-03:** Password handling MUST use bcrypt with minimum cost factor 12
- **SR-04:** Session tokens MUST have a configurable expiry (default 8 hours)
- **SR-05:** Any third-party integration MUST document what data it receives
- **SR-06:** CORS changes MUST be reviewed against the allowed origins list in `SECURITY.md`
- **SR-07:** Input validation MUST occur at the API boundary — Pydantic models are the minimum standard
- **SR-08:** Secrets MUST be referenced via `os.environ` or `python-dotenv` — never string literals

---

## 8. API Design Rules

When designing new API endpoints:

- **API-01:** URL structure MUST follow `/resource/sub-resource/` with trailing slash
- **API-02:** All endpoints MUST use Pydantic `BaseModel` for request and response bodies
- **API-03:** HTTP status codes MUST follow: 200 (success), 201 (created), 400 (bad input), 401 (unauthenticated), 403 (forbidden), 404 (not found), 422 (validation error)
- **API-04:** Error responses MUST use `{"detail": "<message>"}` format (FastAPI default)
- **API-05:** Query parameters MUST be validated with `Query(pattern=...)` where format matters
- **API-06:** All routes MUST be grouped in a dedicated file under `src/api/routes/`
- **API-07:** Business logic MUST NOT appear in route handlers — delegate to `src/services/`
- **API-08:** All new routers MUST be registered in `src/api/main.py` with a descriptive tag

---

## 9. Frontend Design Rules

When designing new frontend features:

- **FE-01:** All pages MUST be wrapped in `<ProtectedRoute>` except `/login`
- **FE-02:** Manager-only actions MUST be hidden (not just disabled) for `User` role
- **FE-03:** Loading states MUST be shown for all async operations
- **FE-04:** Error states MUST display a human-readable message in a styled error banner
- **FE-05:** Empty states MUST display a helpful message (not a blank screen)
- **FE-06:** All API calls MUST include `Authorization: Bearer <token>` from `AuthContext`
- **FE-07:** New routes MUST be declared in `App.jsx` with role enforcement
- **FE-08:** Chart components MUST be responsive using `ResponsiveContainer` from Recharts
- **FE-09:** Tailwind classes MUST be used for all styling — no inline style objects except for dynamic values (e.g. chart colours)

---

## 10. Testing Requirements

### 10.1 Coverage Rules
- **TEST-01:** Every function in `src/services/` MUST have at least one unit test
- **TEST-02:** Every new service module MUST have a corresponding `tests/test_<module>.py` file
- **TEST-03:** Tests MUST cover: happy path, empty/zero input, invalid input, boundary values
- **TEST-04:** Tests MUST NOT depend on external services, databases, or network calls
- **TEST-05:** Test data MUST use the seed data defined in the service's in-memory store

### 10.2 Test Naming Convention
```
test_<function_name>_<scenario>()

Examples:
  test_get_history_structure()
  test_wma_all_zeros_returns_zero()
  test_forecast_confidence_band_valid()
```

### 10.3 CI Gate
- All tests MUST pass before a PR can be merged
- Test failures MUST be resolved — do not bypass with `--ignore` flags
- New features MUST NOT reduce overall test count

---

## 11. CI/CD Requirements

- **CI-01:** CI MUST run on every push to `main` and every PR targeting `main`
- **CI-02:** CI MUST use Python 3.11 to match production target
- **CI-03:** CI MUST install dependencies from `requirements.txt` before running tests
- **CI-04:** CI MUST run the full test suite: `pytest tests/ -v`
- **CI-05:** CI failures MUST block merges — branch protection MUST be enabled on `main`
- **CI-06:** All config loading MUST have fallback defaults so CI does not fail due to missing `settings.yaml`
- **CI-07:** Frontend build checks MAY be added in a future phase but are not required in MVP

---

## 12. Output Templates

### 12.1 Feature Design Document Template
```
# Feature Design: <Feature Name>
**Version:** 0.1.0
**Date:** YYYY-MM-DD
**Status:** Draft | Review | Approved
**Issue:** #<number>
**Requirements:** FR-XXX, NFR-XXX

## Problem Statement
<Why this feature is needed>

## Proposed Solution
<High-level approach>

## API Changes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| ...    | ...  | ...  | ...         |

## Data Model
<Pydantic models or schema definitions>

## Frontend Changes
<Components added/modified, routing changes>

## Security Considerations
<Auth, validation, data exposure risks>

## Test Plan
- [ ] <test case 1>
- [ ] <test case 2>

## Open Questions
- <any unresolved decisions>
```

### 12.2 GitHub Issue Body Template
```
## Description
<What and why>

## Requirements
Addresses: REQ-XXX / FR-XXX

## Acceptance Criteria
- [ ] <verifiable condition 1>
- [ ] <verifiable condition 2>

## Implementation Notes
<Technical constraints or decisions>
```

### 12.3 PR Body Template
```
## Summary
- <bullet 1>
- <bullet 2>

## Test Plan
- [ ] <test step 1>
- [ ] <test step 2>

🤖 Generated with Claude Code
```

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-03-03 | Initial creation |
