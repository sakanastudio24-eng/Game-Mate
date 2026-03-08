# `posts/` Folder Overview

Purpose: Feed content foundation (posts + engagement signals).

## Responsibilities
- Stores creator posts used by feed/recommendation features.
- Stores interaction events used for ranking and analytics.
- Exposes admin access for post and interaction inspection.

## File map
- `models.py`: `Post` and `Interaction` entities.
- `admin.py`: admin registrations.
- `apps.py`: Django app config.
- `views.py`: placeholder for upcoming post/feed endpoints.
- `tests.py`: placeholder for app-level tests.
- `migrations/`: schema history for post domain.
