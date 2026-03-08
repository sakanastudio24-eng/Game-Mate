# `config/settings/` Folder Overview

Purpose: Environment-split settings package.

## Definition Notes
- `base.py`: shared defaults (installed apps, middleware, DB config, DRF, JWT, auth model).
- `dev.py`: development overrides (debug/logging/CORS).
- `prod.py`: production security flags.
- `__init__.py`: runtime selector by `DJANGO_ENV`.

## Module Notes
- Keep shared values in `base.py` only.
- Keep environment-only differences in `dev.py`/`prod.py`.
- Keep credentials in `.env` and never hardcode secrets here.
