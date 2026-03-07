# Backend Handoff Checklist (Django + DRF)

Use this checklist before handing backend work back to frontend integration.

## 1) Environment and Project Setup
- [ ] Python 3.12+ confirmed
- [ ] Virtual environment created and activated
- [ ] Django project initialized inside `src/`
- [ ] Django REST Framework installed and configured
- [ ] `.env` loaded from `.env.example`
- [ ] Database configured and migrations run

## 2) API Contract Alignment
- [ ] Endpoints match `docs/FLOWS_BACKEND.md`
- [ ] AI routes match `docs/AI_HANDOFF.md`
- [ ] Request/response field names match frontend expectations
- [ ] Notification presets/time-sheet payload schema implemented
- [ ] Delete-account endpoint (`DELETE /api/me`) implemented

## 3) Error and Validation Behavior
- [ ] Standard error envelope implemented
- [ ] 400/401/403/404/409/422/429/500 statuses used correctly
- [ ] Enum/time/day validations implemented for notifications
- [ ] Idempotent behavior for retry-prone routes (join/leave/delete)

## 4) Security and Reliability
- [ ] CORS restricted to known origins
- [ ] Secret key and DB credentials not committed
- [ ] Auth middleware applied to protected routes
- [ ] Pagination implemented for list-heavy endpoints
- [ ] Rate limiting applied to AI and messaging routes

## 5) Integration Readiness
- [ ] Local health endpoint returns success
- [ ] Frontend can hit API base URL without schema mismatch
- [ ] Sample data/fixtures available for local testing
- [ ] README updated with run/setup steps
- [ ] Open items and risks documented

## 6) Deployment and Database Path
- [ ] Local dev uses PostgreSQL (confirmed)
- [ ] Initial deploy target selected (Render/Fly.io/Hetzner/etc.)
- [ ] Production environment variables defined per platform
- [ ] Migration plan documented from initial hosted PostgreSQL to Supabase PostgreSQL

## Current Build Notes (Phase 2)
- JWT auth routes are active:
  - `POST /api/auth/token/`
  - `POST /api/auth/token/refresh/`
  - `POST /api/auth/logout/`
- Accounts baseline route is active:
  - `GET /api/accounts/me/`
- Token blacklist migrations are applied.
- Group owner membership auto-creation signal is implemented and verified.
- Common local auth test pitfalls:
  - `405` occurs when `/api/auth/token/` is called with `GET` instead of `POST`.
  - `curl (7)` occurs when `runserver` is not active on `127.0.0.1:8000`.
  - `401 Authentication credentials were not provided` occurs when `Authorization` is added to request body instead of headers.
  - Detailed incident note: `POSTMORTEM.md` (2026-03-05 entry).
