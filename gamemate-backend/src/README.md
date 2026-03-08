# `src/` Folder Overview

Purpose: Django project runtime root for the GameMate backend.

## Key files
- `manage.py`: Django management entry point (runserver, migrate, shell, etc.).
- `requirements.txt`: Python dependency lock snapshot used by this backend workspace.
- `db.sqlite3`: local SQLite artifact from early bootstrap/testing.

## Key folders
- `accounts/`: auth domain (custom user, profile, JWT/me endpoints).
- `groups/`: group domain (groups, memberships, permissions, join/leave/invite/promote).
- `posts/`: feed domain foundation (posts + interactions).
- `config/`: project wiring (settings, urls, pagination, ASGI/WSGI).

## Quick command
```bash
../.venv/bin/python manage.py check
```
