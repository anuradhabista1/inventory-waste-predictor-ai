# Security Policy

## Overview

This document describes the security model, known limitations, and vulnerability reporting process for the **Inventory Waste Predictor AI** project.

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` branch | ✅ Active development |
| Older branches | ❌ Not supported |

---

## Reporting a Vulnerability

If you discover a security vulnerability, **do not open a public GitHub issue**.

Please report it privately:

1. Email the maintainer at the address listed on the GitHub profile, or
2. Open a [GitHub Security Advisory](https://github.com/anuradhabista1/inventory-waste-predictor-ai/security/advisories/new) (private disclosure)

Include:
- A clear description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You can expect an acknowledgement within **48 hours** and a resolution plan within **7 days**.

---

## Authentication Model

### Mechanism
- Users authenticate via `POST /auth/login` with a username and password
- On success, the server issues a **UUID v4 session token**
- The token is sent in every subsequent request as `Authorization: Bearer <token>`
- Tokens are validated server-side by looking up an in-memory `_SESSIONS` dictionary

### Session Lifecycle
| Event | Behaviour |
|-------|-----------|
| Login | New UUID token created and stored in memory |
| Logout | Token removed from `_SESSIONS` |
| Server restart | **All sessions invalidated** (in-memory store is reset) |
| Token expiry | **Not implemented** — tokens are valid until logout or restart |

### Credentials (MVP defaults)
| Username | Password | Role |
|----------|----------|------|
| `Admin` | `admin` | Manager |
| `Viewer` | `viewer` | User |

> ⚠️ **These are hardcoded demo credentials. Change them before any non-local deployment.**

---

## Role-Based Access Control (RBAC)

Two roles are enforced via FastAPI `Depends()` on every protected route:

| Role | Permissions |
|------|-------------|
| **Manager** | Read + Write: intake submission, consumption editing, all GET endpoints |
| **User** | Read-only: inventory list, monthly summary (view), reports |

Enforcement happens in `src/api/dependencies.py`:
- `require_auth` — any authenticated user
- `require_role("Manager")` — Manager only

---

## Known Security Limitations (MVP)

These are intentional simplifications for the current MVP stage. They **must** be addressed before production deployment.

| # | Limitation | Risk | Recommended Fix |
|---|-----------|------|-----------------|
| 1 | **Plaintext passwords** in `auth_service.py` | High | Hash with `bcrypt` or `argon2` |
| 2 | **No token expiry** | Medium | Add expiry timestamp; use JWT with `exp` claim |
| 3 | **In-memory session store** | Medium | Sessions lost on restart; migrate to Redis or DB |
| 4 | **In-memory data store** | High | All inventory data lost on restart; migrate to PostgreSQL |
| 5 | **Hardcoded credentials** | Critical | Load from environment variables or a secrets manager |
| 6 | **No HTTPS enforcement** | High | Use TLS termination via reverse proxy (nginx, Caddy) |
| 7 | **No rate limiting on `/auth/login`** | Medium | Add brute-force protection (slowapi, fail2ban) |
| 8 | **CORS allows localhost origins only** | Low | Restrict to production domain(s) before going live |
| 9 | **No input sanitisation beyond Pydantic** | Low | Add explicit length limits and reject unexpected fields |

---

## CORS Configuration

CORS is currently restricted to local development origins:

```python
allow_origins=["http://localhost:5173", "http://localhost:5174"]
```

For production, replace these with your actual frontend domain(s).

---

## Dependency Security

Keep dependencies up to date. Run periodic audits:

```bash
# Python
pip install pip-audit
pip-audit

# Node (frontend)
cd frontend
npm audit
```

---

## Environment Variables

Never commit secrets to version control. Use environment variables for:

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | JWT signing secret (when JWT is adopted) |
| `DATABASE_URL` | PostgreSQL connection string |
| `ALLOWED_ORIGINS` | Comma-separated list of trusted CORS origins |

A `.env.example` template is provided in the repository root.
