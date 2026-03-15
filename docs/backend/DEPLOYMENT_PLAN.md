# GameMate Backend Deployment Plan (v1)

## Platform and Services
- App hosting: Render or Fly.io (start with one)
- Database: managed PostgreSQL (Render Postgres, Supabase, or Neon)
- Frontend: mobile app deployed separately (Expo/React Native)

## Runtime and Server
- Python app server: Gunicorn (`gunicorn config.wsgi:application`)
- Django settings: `DJANGO_ENV=prod`
- Database via env vars (`DB_*`)

## Environment Strategy
Set production secrets in hosting dashboard, not in repo:
- `DJANGO_SECRET_KEY`
- `ALLOWED_HOSTS`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `CORS_ALLOWED_ORIGINS`

## Static Files
- Keep static handling minimal for v1.
- If needed for admin/static delivery in one container, add `whitenoise` in a later pass.

## Domain and Rollout Sequence
1. Deploy backend to managed host.
2. Attach managed PostgreSQL.
3. Set env vars and run migrations.
4. Validate health and auth endpoints.
5. Point a domain such as `api.gamemate.<domain>`.
6. Connect mobile app API base URL to production endpoint.

## Future Hardening
- Add CI deploy checks and migration gating.
- Add structured logging and error tracking.
- Add backup/restore runbook for Postgres.
