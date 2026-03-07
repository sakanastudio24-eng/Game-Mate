# GameMate Backend

Django + Django REST Framework backend skeleton for GameMate.

## Tech Stack
- Python 3.12+
- Django
- Django REST Framework (RESTful API design)
- SimpleJWT
- PostgreSQL (recommended)
- django-environ
- django-cors-headers

## Repo Skeleton

```text
gamemate-backend/
  src/
  .env.example
  .gitignore
  README.md
  HANDOFF_CHECKLIST.md
```

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

## Django Project Init (already applied)

```bash
cd src
django-admin startproject config .
```

## Settings Layout

- `src/config/settings/base.py`
- `src/config/settings/dev.py`
- `src/config/settings/prod.py`
- `src/config/settings/__init__.py` (defaults to `dev`)

Default runtime module:
- `config.settings` (resolved via `__init__.py` -> `dev`)

Production runtime module:
```bash
export DJANGO_SETTINGS_MODULE=config.settings.prod
```

## Local Check

```bash
cd src
python manage.py check
```

## Auth Model Ordering Rule (Critical)

Define custom user model **before first migrate**:
1. Create `accounts` app
2. Define `accounts.User`
3. Set `AUTH_USER_MODEL = "accounts.User"`
4. Then run first migration

This repo has already applied that order with `User` + `Profile` in `accounts`.

## Infrastructure Plan Note

- Backend framework: Django + Django REST Framework.
- Local development database: PostgreSQL (local instance).
- Initial deployment options: Render / Fly.io / Hetzner (or equivalent).
- Planned database migration path: move from initial hosted PostgreSQL to Supabase PostgreSQL once backend stability is confirmed.

## Notes
- `.env.example` is committed with placeholder values only.
- Do not commit real credentials.
- Contracts to implement next:
  - frontend/backend route contracts in `../docs/FLOWS_BACKEND.md`
  - AI contracts in `../docs/AI_HANDOFF.md`

## Phase 2 Notes (DRF + JWT + Base Routes)

Implemented in this phase:
- SimpleJWT blacklist support enabled in settings:
  - `rest_framework_simplejwt.token_blacklist`
  - token lifetimes + rotation + blacklist-after-rotation
- Auth endpoints:
  - `POST /api/auth/token/`
  - `POST /api/auth/token/refresh/`
  - `POST /api/auth/logout/` (blacklist refresh token)
- Account bootstrap endpoint:
  - `GET /api/accounts/me/` (authenticated user + profile payload)
- Groups domain hardening:
  - Owner auto-membership signal on group create
  - Explicit unique membership constraint (`user`, `group`)
  - Admin registration for `Group` and `GroupMembership`

Quick API smoke test:
1. `POST /api/auth/token/` with email/password
2. `GET /api/accounts/me/` with `Authorization: Bearer <access>`
3. `POST /api/auth/logout/` with refresh token to revoke

### Auth Troubleshooting Notes
- `405 Method "GET" not allowed` on `/api/auth/token/` means the request was sent as `GET`. Use `POST`.
- `curl: (7) Failed to connect to 127.0.0.1:8000` means Django server is not running.
- Start server:
  - `cd src`
  - `../.venv/bin/python manage.py runserver 127.0.0.1:8000`
- Token request example:
  - `curl -X POST http://127.0.0.1:8000/api/auth/token/ -H "Content-Type: application/json" -d '{"email":"you@example.com","password":"your_password"}'`
