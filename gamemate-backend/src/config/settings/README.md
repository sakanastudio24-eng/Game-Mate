# `config/settings/` Folder Overview

Purpose: Environment-split Django settings modules.

## Module roles
- `base.py`: shared defaults (apps, middleware, DB, DRF, JWT, auth model).
- `dev.py`: development overrides (debug/logging/CORS hosts).
- `prod.py`: production hardening flags.
- `__init__.py`: selects `dev` or `prod` based on `DJANGO_ENV`.

## Rule of use
- Keep shared defaults in `base.py`.
- Put environment-only differences in `dev.py` and `prod.py`.
- Never store real secrets in settings files; use `.env`.
