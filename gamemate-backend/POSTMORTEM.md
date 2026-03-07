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
