# Config

Purpose:
- define project-wide Django behavior

Key responsibilities:
- settings split by environment
- global DRF auth, pagination, throttling, and exception handling
- main URL routing
- Sentry and Celery setup

Notable files:
- `settings/base.py`: shared backend defaults
- `urls.py`: top-level API route registration
- `exceptions.py`: normalized API error envelope
- `pagination.py`: stable paginated response shape
