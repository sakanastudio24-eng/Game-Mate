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

## Code Notes (Single Map)

Use this as the one high-level backend map (instead of per-folder markdown files).

- `src/accounts/`
  - Definition: auth identity + profile domain.
  - Main classes: `User`, `Profile`, `LoginView`, `AuthTokenRefreshView`, `AuthLogoutView`, `MeView`, `LoginThrottle`.
  - Main functions: `create_profile` signal.
- `src/groups/`
  - Definition: groups, memberships, permissions, owner/member actions.
  - Main classes: `Group`, `GroupMembership`, `GroupViewSet`, `IsGroupMember`, `IsGroupOwner`.
  - Main functions: `_validate_group_name`, `_validate_group_description`, `add_owner_membership` signal.
- `src/posts/`
  - Definition: feed posts, interactions, and feed endpoint assembly.
  - Main classes: `Post`, `PostInteraction`, `PostViewSet`, `PostInteractionViewSet`, `FeedView`.
  - Services: `FeedService.get_feed(...)` (ranking + diversity + metadata).
- `src/config/`
  - Definition: project routing + pagination + settings package.
  - Main classes: `StandardPageNumberPagination`.

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

## Current API Notes

Implemented and active:
- Custom JWT auth views with response envelopes:
  - `POST /api/auth/token/`
  - `POST /api/auth/token/refresh/`
  - `POST /api/auth/logout/`
- Account bootstrap endpoint:
  - `GET /api/accounts/me/`
- Groups endpoints:
  - paginated `GET /api/groups/` (PageNumberPagination, `PAGE_SIZE=3`)
  - `POST /api/groups/{id}/join/`
  - `POST /api/groups/{id}/leave/`
  - `GET /api/groups/{id}/members/`
  - `POST /api/groups/{id}/invite/`
  - `POST /api/groups/{id}/promote/`

Security and reliability:
- Global throttling:
  - anon `100/day`
  - user `1000/day`
- Login throttle:
  - `10/min` per IP on `/api/auth/token/`

Quick API smoke test:
1. `POST /api/auth/token/` with email/password
2. `GET /api/accounts/me/` with `Authorization: Bearer <access>`
3. `GET /api/groups/` and verify `count/next/previous/results` pagination shape
4. `POST /api/auth/logout/` with refresh token to revoke

### Auth + Local Troubleshooting Notes
- `405 Method "GET" not allowed` on `/api/auth/token/` means the request was sent as `GET`. Use `POST`.
- `curl: (7) Failed to connect to 127.0.0.1:8000` means Django server is not running.
- Start server:
  - `cd src`
  - `../.venv/bin/python manage.py runserver 127.0.0.1:8000`
- Token request example:
  - `curl -X POST http://127.0.0.1:8000/api/auth/token/ -H "Content-Type: application/json" -d '{"email":"you@example.com","password":"your_password"}'`
