# `accounts/` Folder Overview

Purpose: Authentication and account identity layer.

## Responsibilities
- Owns custom `User` model (email login) and `Profile` model.
- Exposes auth API views (`token`, `refresh`, `logout`) and `me` endpoint.
- Applies login throttling for brute-force protection.
- Registers user/profile admin surfaces.

## File map
- `models.py`: `User`, `Profile`, auto-profile creation signal.
- `views.py`: JWT + `me` API endpoints.
- `serializers.py`: profile/user response serializers.
- `throttles.py`: login throttle.
- `urls.py`: account routes.
- `admin.py`: admin registrations for user/profile.
- `signals.py`: account signal hooks.
- `migrations/`: schema history for account models.
