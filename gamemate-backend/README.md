# GameMate Backend

Production-style v1 backend for GameMate built on Django + DRF + PostgreSQL.

## Stack
- Django
- PostgreSQL
- JWT auth
- Sentry monitoring
- Python 3.14
- Django 6
- Django REST Framework
- SimpleJWT
- PostgreSQL
- Celery + Redis
- Sentry

## Core Systems
- authentication
- profile system
- friend system
- groups
- feed ranking
- explainable feed
- notifications

## Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
cp -n .env.example .env
cd src
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Architecture
Service-oriented module layout:
- `accounts`: custom auth user, profile, JWT auth views, `/me`
- `groups`: group entity, memberships, role/visibility permissions
- `posts`: posts, interactions, feed APIs, ranking services
- `connections`: friend requests and accepted connection graph
- `messages`: DM threads, messages, unread behavior
- `notifications`: event-driven notification storage + APIs
- `activity`: activity logging domain
- `core/services`: shared event controls (rate-limited event dispatch)
- `config`: settings, URL routing, pagination

Design rule:
- `views` handle HTTP
- `services` hold business logic
- `models` hold data constraints
- service layer
- event signals
- soft delete system
- rate limiting

## Feed Algorithm
Feed is assembled through `FeedService` and returns ranked items with metadata.

Current scoring signals include:
- engagement (`like/share/comment` weighted)
- recency
- user interest match (`profile.favorite_games`)
- social graph boost (`friend_post`)
- diversity controls (penalty for repeating recent games)
- weighted scoring
- recency bias
- engagement signals
- user interest matching

Feed response includes explainability fields via `feed_meta`:
- `source`
- `reasons`
- `signals`

`/api/feed/explain/{post_id}/` provides per-post reason transparency.

## Signals and Events
Domain events trigger side effects through app signals and services:
- post interactions -> notifications/activity
- connection actions -> notifications/activity
- messaging actions -> notifications/activity
- group create -> owner membership auto-provision
- user create -> profile auto-provision

Asynchronous side effects run through Celery when available, with local-safe fallback behavior where configured.

## Rate Limiting
API throttling (DRF):
- anonymous: `100/day`
- authenticated: `1000/day`
- login endpoint: `10/min` per IP

Event-level guardrail:
- `core/services/event_service.py` applies per-user limits for noisy event types (`like`, `message`, `friend_request`, etc.).

## Observability
Sentry is configured in base settings:
- Django integration enabled
- request/user context enabled (`send_default_pii=True`)
- tracing enabled (`traces_sample_rate=1.0`)

Verification routes:
- `/sentry-debug/`
- `/crash/`

These endpoints intentionally raise exceptions and should be removed or restricted before production deploys.

## API Surface (v1)
Auth:
- `POST /api/auth/token/`
- `POST /api/auth/token/refresh/`
- `POST /api/auth/logout/`

Accounts/Profile:
- `GET /api/accounts/me/`
- `GET /api/profile/me/`
- `PATCH /api/profile/me/`
- `GET /api/profile/{username}/`
- `GET /api/profile/{username}/posts/`

Groups:
- `GET /api/groups/` (paginated)
- `POST /api/groups/`
- `GET /api/groups/{id}/`
- `PATCH /api/groups/{id}/`
- `DELETE /api/groups/{id}/`
- `POST /api/groups/{id}/join/`
- `POST /api/groups/{id}/leave/`
- `GET /api/groups/{id}/members/`
- `POST /api/groups/{id}/invite/`
- `POST /api/groups/{id}/promote/`

Posts/Feed:
- `GET /api/posts/`
- `POST /api/posts/`
- `GET /api/posts/{id}/`
- `PATCH /api/posts/{id}/`
- `DELETE /api/posts/{id}/` (soft delete)
- `POST /api/posts/{id}/like/`
- `POST /api/posts/{id}/share/`
- `POST /api/posts/{id}/skip/`
- `POST /api/posts/restore/{post_id}/`
- `POST /api/interactions/`
- `POST /api/share/{post_id}/{user_id}/`
- `GET /api/feed/`
- `GET /api/feed/explain/{post_id}/`

Connections:
- `GET /api/friends/`
- `POST /api/friends/request/{user_id}/`
- `POST /api/friends/request/{connection_id}/accept/`
- `POST /api/connections/add/{user_id}/`
- `POST /api/connections/accept/{connection_id}/`
- `GET /api/connections/friends/`

Notifications:
- `GET /api/notifications/`

Messages:
- `GET /api/messages/threads/`
- `POST /api/messages/thread/{user_id}/`
- `POST /api/messages/send/{thread_id}/`
- `GET /api/messages/messages/{thread_id}/`

## Deployment Notes
- Suitable first hosts: Render / Fly.io / Hetzner
- Managed PostgreSQL recommended in hosted environments
- Keep `.env` secrets out of git; only `.env.example` is committed
- Consider Gunicorn + reverse proxy in production
