# Backend Postmortem Notes

## 2026-03-05: Postman 401 on `/api/accounts/me/`

### Symptom
- `GET /api/accounts/me/` returned:
  - `401 Unauthorized`
  - `{"detail":"Authentication credentials were not provided."}`

### Root Cause
- `Authorization: Bearer <access_token>` was entered in the **Body** tab instead of request **Headers**.
- For this endpoint, DRF only reads auth from headers, not GET body payload.

### Fix
- In Postman:
  - Method: `GET`
  - URL: `http://127.0.0.1:8000/api/accounts/me/`
  - Header: `Authorization: Bearer <full_access_token>`
  - Keep body empty

### Prevention
- Prefer Postman **Auth** tab:
  - Type: `Bearer Token`
  - Paste access token there
- Keep trailing slash on endpoint (`/me/`) to avoid redirects that may drop auth headers.
- Use environment variable:
  - `auth_token`
  - Header value `Bearer {{auth_token}}`

### Team Note
- Common false alarm: password and JWT look valid, but credentials are not transmitted because header was placed in body.

## 2026-03-07: Phone Login `Network request failed`

### Symptom
- Expo app was running and Django `runserver` was running, but login requests failed with network errors.

### Root Cause
- Backend was started from the wrong directory and/or on loopback only.
- Frontend sometimes pointed at `localhost`, which resolves to the phone itself.
- `ALLOWED_HOSTS` did not include the Mac LAN IP.

### Fastest Stable Process
- Backend:
  - `cd /Users/zech/Downloads/The-Big-One/GameMate/gamemate-backend`
  - `./.venv/bin/python ./src/manage.py runserver 0.0.0.0:8002`
- Frontend:
  - `cd /Users/zech/Downloads/The-Big-One/GameMate`
  - `LAN_IP=$(ipconfig getifaddr en0)`
  - `echo "EXPO_PUBLIC_API_URL=http://$LAN_IP:8002" > .env`
  - `npx expo start --lan -c`
- Backend `.env`:
  - `ALLOWED_HOSTS=localhost,127.0.0.1,<LAN_IP>`

### Prevention
- Always run backend using absolute repo paths (avoid `cd src` from frontend repo).
- Use `EXPO_PUBLIC_API_URL` with LAN IP for phone testing.
- Keep port consistent across backend and frontend (`8000` or `8002`, not mixed).

## 2026-03-08: Messages App Label Collision (`messages`)

### Symptom
- `python manage.py makemigrations messages` failed with:
  - `ImproperlyConfigured: Application labels aren't unique, duplicates: messages`

### Root Cause
- Django already uses app label `messages` from `django.contrib.messages`.
- New DM app used package name `messages`, which duplicated the app label.

### Fix
- Set explicit app config label in `src/messages/apps.py`:
  - `label = "dm_messages"`
- Register app in `INSTALLED_APPS` as:
  - `"messages.apps.MessagesConfig"`
- Run migrations with the unique label:
  - `python manage.py makemigrations dm_messages`
  - `python manage.py migrate dm_messages`

### Prevention
- Before adding new apps, check for collisions against built-in Django app labels.
- Prefer explicit app labels for common names (`messages`, `auth`, `admin`, etc.).

## 2026-03-13: Login 401 Message and Back-Navigation Loop

### Symptom
- Wrong credentials on login showed a session-expired style message instead of a credential error.
- Android back behavior could bounce between screens in a loop for some navigation paths.

### Root Cause
- Frontend API helper mapped all `401` responses to a single “Session expired” message, including login failures.
- Back helper used a history fallback that pushed routes, which could re-add previously visited routes and create ping-pong behavior.

### Fix
- API helper now distinguishes:
  - unauthenticated login request `401`: show backend credential error.
  - authenticated request `401` (Bearer token present): show session-expired message.
- Back helper now:
  - uses stack pop first (`goBack` on any navigator parent),
  - uses history fallback with `replace` (not `push`) when needed,
  - exits correctly on Android root routes instead of looping through tab history.

### Prevention
- Treat `401` as context-aware (`login` vs `token-authenticated request`) in frontend API clients.
- Keep root-route hardware back behavior explicit and avoid custom tab-history back loops.
