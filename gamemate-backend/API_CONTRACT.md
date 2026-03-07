# GameMate Backend API Contract

**Version:** v1 (current implementation)
**Stack:** Django + DRF + PostgreSQL
**Auth:** JWT Bearer
**Base URL (local):** `http://127.0.0.1:8000`

---

## Authentication

### POST `/api/auth/token/`
Request:
```json
{ "email": "user@email.com", "password": "password123" }
```
Response:
```json
{
  "success": true,
  "data": {
    "refresh": "jwt_refresh_token",
    "access": "jwt_access_token"
  }
}
```
Throttle: `login` scope (`10/min` per IP)

### POST `/api/auth/token/refresh/`
Request:
```json
{ "refresh": "jwt_refresh_token" }
```
Response:
```json
{
  "success": true,
  "data": {
    "access": "new_access_token"
  }
}
```

### POST `/api/auth/logout/`
Request:
```json
{ "refresh": "jwt_refresh_token" }
```
Response:
```json
{ "success": true, "message": "Logged out." }
```

---

## Account

### GET `/api/accounts/me/`
Headers:
`Authorization: Bearer <access_token>`

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@email.com",
    "username": "dan",
    "profile": {
      "display_name": "dan",
      "bio": "",
      "created_at": "2026-03-01T20:00:00Z"
    }
  }
}
```

---

## Groups

### Group object shape
```json
{
  "id": 1,
  "name": "Test Group",
  "description": "",
  "is_private": false,
  "owner": {
    "id": 1,
    "username": "dan"
  },
  "member_count": 1,
  "created_at": "2026-03-04T19:34:50Z"
}
```

### GET `/api/groups/`
Visible groups only:
- all public groups
- private groups where requester is owner/member

Paginated response (`PageNumberPagination`, `PAGE_SIZE=3`):
```json
{
  "count": 8,
  "next": null,
  "previous": null,
  "results": [
    { "id": 1, "name": "Test Group", "description": "", "is_private": false, "owner": {"id": 1, "username": "dan"}, "member_count": 1, "created_at": "2026-03-04T19:34:50Z" }
  ]
}
```

### POST `/api/groups/`
Request:
```json
{ "name": "Ranked Squad", "description": "Grinding nightly", "is_private": false }
```
Response:
```json
{ "success": true, "data": { "id": 4, "name": "Ranked Squad", "description": "Grinding nightly", "is_private": false, "owner": {"id": 1, "username": "dan"}, "member_count": 1, "created_at": "..." } }
```

Validation:
- `name`: 3..80 chars (trimmed)
- `description`: max 500 chars (trimmed)

### GET `/api/groups/{group_id}/`
Response:
```json
{ "success": true, "data": { "id": 1, "name": "Test Group", "description": "", "is_private": false, "owner": {"id": 1, "username": "dan"}, "member_count": 1, "created_at": "..." } }
```
Private group access requires owner/member.

### PATCH `/api/groups/{group_id}/`
Owner only.
Response:
```json
{ "success": true, "data": { "id": 1, "name": "Updated Group", "description": "...", "is_private": false, "owner": {"id": 1, "username": "dan"}, "member_count": 1, "created_at": "..." } }
```

### DELETE `/api/groups/{group_id}/`
Owner only.
Response:
```json
{ "success": true, "message": "Group deleted." }
```

### POST `/api/groups/{group_id}/join/`
Responses:
```json
{ "success": true, "message": "Joined." }
```
```json
{ "success": true, "message": "Already a member." }
```
```json
{ "success": false, "message": "This group is private. Invite required." }
```

### POST `/api/groups/{group_id}/leave/`
Responses:
```json
{ "detail": "You left the group." }
```
```json
{ "detail": "You are not a member." }
```
```json
{ "detail": "Owner cannot leave their own group." }
```

### GET `/api/groups/{group_id}/members/`
Response:
```json
{
  "success": true,
  "results": [
    {
      "user_id": 2,
      "email": "member@email.com",
      "username": "member",
      "role": "member",
      "joined_at": "2026-03-01T21:00:00Z"
    }
  ]
}
```

### POST `/api/groups/{group_id}/invite/`
Owner only.
Request:
```json
{ "username": "zan" }
```
(`username` field accepts either username or email lookup)

Responses:
```json
{ "detail": "User invited successfully." }
```
```json
{ "detail": "Only the owner can invite users." }
```
```json
{ "detail": "User not found." }
```
```json
{ "detail": "User already in group." }
```

### POST `/api/groups/{group_id}/promote/`
Owner only.
Request:
```json
{ "username": "zan" }
```
Responses:
```json
{ "detail": "User promoted to admin." }
```
```json
{ "detail": "Only owner can promote members." }
```
```json
{ "detail": "User not found." }
```
```json
{ "detail": "User not in group." }
```

---

## Rate Limiting

Configured globally in DRF:
- `anon`: `100/day`
- `user`: `1000/day`
- `login`: `10/min` (via `LoginThrottle` on token endpoint)

Throttle response:
```json
{ "detail": "Request was throttled." }
```

---

## Notes

- Keep trailing slashes in routes.
- All protected routes require `Authorization: Bearer <access_token>`.
- JWT auth endpoints are custom views returning wrapped envelopes.
