# `src/` Folder Overview

Purpose: Django project runtime root for the GameMate backend.

## Definition Notes
- `manage.py`: management entrypoint (`runserver`, `migrate`, `check`, `shell`).
- `accounts/`: authentication and user identity domain.
- `groups/`: group lifecycle and membership domain.
- `posts/`: feed content + interaction + ranking domain.
- `config/`: runtime wiring (urls/settings/pagination/ASGI/WSGI).

## Class Notes (Cross-Folder Index)
- Accounts: `User`, `Profile`, `LoginView`, `MeView`, `LoginThrottle`.
- Groups: `Group`, `GroupMembership`, `GroupViewSet`, permission classes.
- Posts: `Post`, `PostInteraction`, `PostViewSet`, `PostInteractionViewSet`, `FeedView`, `FeedService`.
- Config: `StandardPageNumberPagination`.

## Quick command
```bash
../.venv/bin/python manage.py check
```
