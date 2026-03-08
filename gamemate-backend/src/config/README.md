# `config/` Folder Overview

Purpose: Django project wiring and runtime configuration entrypoints.

## Responsibilities
- Global URL routing for API/admin.
- WSGI/ASGI startup configuration.
- Shared API pagination shape.
- Settings package bootstrap via `config.settings`.

## File map
- `urls.py`: root route table and app includes.
- `pagination.py`: custom paginated response envelope.
- `asgi.py`: ASGI app entrypoint.
- `wsgi.py`: WSGI app entrypoint.
- `settings/`: environment-specific settings modules.
