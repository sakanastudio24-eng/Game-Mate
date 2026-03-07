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
