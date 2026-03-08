# `accounts/migrations/` Folder Overview

Purpose: Schema history for authentication and profile models.

## Definition Notes
- Tracks evolution of custom `User` and `Profile` schema.
- Migration order is critical because `AUTH_USER_MODEL` is customized.

## Migration Notes
- `0001_initial.py`: initial custom user table creation.
- `0002_...`: cleanup/refactor of initial user fields.
- `0003_profile.py`: introduces `Profile` model.
