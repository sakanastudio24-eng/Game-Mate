# `accounts/` Folder Overview

Purpose: Authentication and account identity layer.

## Definition Notes
- Owns custom auth identity (`email` as login field).
- Stores profile data in a 1:1 `Profile` model.
- Provides JWT login/refresh/logout wrappers and `/api/accounts/me/`.
- Applies login throttling to reduce brute-force risk.

## Class Notes
- `User` (`models.py`): custom auth model using `email` as `USERNAME_FIELD`.
- `Profile` (`models.py`): user-facing profile extension (`display_name`, `bio`, timestamps).
- `ProfileSerializer` (`serializers.py`): serializes profile payload for API use.
- `MeSerializer` (`serializers.py`): serializes authenticated user + nested profile.
- `LoginThrottle` (`throttles.py`): IP-based login throttle (`scope = "login"`).
- `LoginView` (`views.py`): token obtain endpoint wrapper with normalized response envelope.
- `AuthTokenRefreshView` (`views.py`): refresh endpoint wrapper with normalized response envelope.
- `AuthLogoutView` (`views.py`): refresh token blacklist endpoint.
- `MeView` (`views.py`): authenticated "current user" endpoint.
- `AccountsConfig` (`apps.py`): app boot config; loads signals on startup.

## Function Notes
- `create_profile(...)` (`models.py`): auto-creates `Profile` on new user creation.
- `handle_user_post_save(...)` (`signals.py`): reserved hook for future bootstrap side effects.

## File map
- `models.py`, `serializers.py`, `views.py`, `urls.py`, `throttles.py`, `admin.py`, `signals.py`, `migrations/`.
