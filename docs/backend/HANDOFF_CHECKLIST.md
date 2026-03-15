# Backend Handoff Checklist (Django + DRF)

Use this checklist before handing backend work to frontend integration.

## 1) Environment and Project Setup
- [x] Python 3.12+ confirmed
- [x] Virtual environment created and activated
- [x] Django project initialized inside `src/`
- [x] DRF installed and configured
- [x] `.env` loaded from `.env.example`
- [x] PostgreSQL configured and migrations running

## 2) API Contract Alignment
- [x] Auth, groups, posts/feed, connections, notifications, and messages are documented in `API_CONTRACT.md`
- [x] Request/response field names aligned to current implementation
- [ ] Standardized response envelope across all endpoints (planned v1.1 cleanup)
- [ ] Delete-account endpoint (`DELETE /api/me`) implemented

## 3) Security and Validation
- [x] JWT auth middleware applied to protected routes
- [x] Group permission model enforced (owner/member/private visibility)
- [x] Group validation rules implemented (name + description bounds)
- [x] Post soft-delete implemented (`is_deleted`, `deleted_at`)
- [x] Messaging participant checks implemented for read/send

## 4) Reliability and Operations
- [x] Pagination enabled (`StandardPageNumberPagination`, `PAGE_SIZE=3`)
- [x] Global throttling enabled (`anon`, `user`)
- [x] Login throttle enabled (`10/min`)
- [x] Local system check passes (`python manage.py check`)
- [x] Notification events emitted from social actions

## 5) Integration Readiness
- [x] Auth endpoints active
- [x] Account + profile endpoints active
- [x] Group lifecycle + membership endpoints active
- [x] Feed + interactions endpoints active
- [x] Connections endpoints active
- [x] Notifications endpoint active
- [x] DM thread/message endpoints active

## 6) Deployment and Database Path
- [x] Local dev uses PostgreSQL
- [x] Deployment strategy documented (`DEPLOYMENT_PLAN.md`)
- [x] Production env var strategy documented
- [x] Path to managed Postgres documented

## Current Build Notes (March 2026)
- JWT routes:
  - `POST /api/auth/token/`
  - `POST /api/auth/token/refresh/`
  - `POST /api/auth/logout/`
- Profile routes:
  - `GET /api/accounts/me/`
  - `GET/PATCH /api/profile/me/`
- Feed + social routes:
  - `GET /api/feed/`
  - `GET /api/feed/explain/{post_id}/`
  - `POST /api/interactions/`
  - `POST /api/share/{post_id}/{user_id}/`
- Notifications:
  - `GET /api/notifications/`
- Messages:
  - `GET /api/messages/threads/`
  - `POST /api/messages/thread/{user_id}/`
  - `POST /api/messages/send/{thread_id}/`
  - `GET /api/messages/messages/{thread_id}/`

## Known Follow-Ups
- Normalize all endpoints to one envelope format (`success/data` or equivalent).
- Add read/update endpoints for notifications (`mark-read`, `mark-all-read`).
- Add message pagination for large threads.
- Add health endpoint and deployment smoke probes.
