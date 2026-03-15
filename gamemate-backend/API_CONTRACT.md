# GameMate Backend API Contract

**Version:** v1 (implemented)
**Stack:** Django + DRF + PostgreSQL
**Auth:** JWT Bearer
**Base URL (local):** `http://127.0.0.1:8000`

Media scope note:
- `avatar_url` and `video_url` are URL-based fields only
- file upload/storage endpoints are not implemented in backend v1

All protected routes require:

`Authorization: Bearer <access_token>`

---

## Authentication

### POST `/api/auth/signup/`
Request:
```json
{
  "email": "user@email.com",
  "username": "user",
  "password": "StrongPass123!"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "email": "user@email.com",
    "username": "user"
  }
}
```

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
Throttle: `10/min` per IP.

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

## Account + Profile

### GET `/api/accounts/me/`
Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@email.com",
    "username": "dan",
    "profile": {
      "bio": "",
      "avatar_url": "",
      "favorite_games": [],
      "visibility": "public"
    }
  }
}
```

### GET `/api/profile/me/`
Response:
```json
{
  "success": true,
  "data": {
    "bio": "",
    "avatar_url": "",
    "favorite_games": [],
    "visibility": "public"
  }
}
```

### PATCH `/api/profile/me/`
Request:
```json
{
  "bio": "Competitive Apex player",
  "favorite_games": ["Apex Legends", "Valorant"],
  "visibility": "friends_only"
}
```
Response shape matches GET `/api/profile/me/`.

### GET `/api/profile/{username}/`
Returns profile identity, preferences, and computed stats.
Response:
```json
{
  "success": true,
  "data": {
    "username": "dan",
    "bio": "FPS player",
    "avatar_url": "https://...",
    "favorite_games": ["Valorant", "Apex Legends"],
    "visibility": "public",
    "stats": {
      "posts": 12,
      "friends": 8,
      "groups": 3
    }
  }
}
```

### GET `/api/profile/{username}/posts/`
Returns a paginated profile timeline for the target user.
```json
{
  "success": true,
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "creator": "dan",
      "game": "Apex Legends",
      "title": "Ranked clutch",
      "description": "1v3 final circle",
      "video_url": "",
      "created_at": "..."
    }
  ]
}
```

Visibility rules:
- `public`: any authenticated user can view
- `friends_only`: owner and accepted friends only

Avatar/media note:
- `avatar_url` is stored as a URL string only
- avatar upload handling is intentionally out of scope for this version

---

## Groups

### GET `/api/groups/`
Visibility:
- public groups
- private groups where requester is owner/member

Paginated response (`PAGE_SIZE=3`):
```json
{
  "success": true,
  "count": 8,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Test Group",
      "description": "",
      "is_private": false,
      "owner": { "id": 1, "username": "dan" },
      "member_count": 1,
      "created_at": "2026-03-04T19:34:50Z"
    }
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
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Ranked Squad",
    "description": "Grinding nightly",
    "is_private": false,
    "owner": { "id": 1, "username": "dan" },
    "member_count": 1,
    "created_at": "..."
  }
}
```

Validation:
- `name`: 3..80 chars (trimmed)
- `description`: max 500 chars (trimmed)

### GET `/api/groups/{group_id}/`
Response:
```json
{ "success": true, "data": { "id": 1, "name": "Test Group", "is_private": false } }
```
Private group detail requires owner/member (`403` for non-member).

### PATCH `/api/groups/{group_id}/`
Owner only.
Response:
```json
{ "success": true, "data": { "id": 1, "name": "Updated Group", "description": "..." } }
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
{ "success": true, "message": "Group left." }
```
```json
{ "success": false, "message": "You are not a member." }
```
```json
{ "detail": "Owner cannot leave their own group." }
```

### GET `/api/groups/{group_id}/members/`
Response:
```json
{
  "success": true,
  "count": 1,
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
Owner only. `username` accepts either username or email.
Request:
```json
{ "username": "zan" }
```
Responses:
```json
{ "success": true, "message": "User invited successfully." }
```
```json
{ "success": false, "message": "Only the owner can invite users." }
```
```json
{ "success": false, "message": "User not found." }
```
```json
{ "success": true, "message": "User already in group." }
```

### POST `/api/groups/{group_id}/promote/`
Owner only.
Request:
```json
{ "username": "zan" }
```
Responses:
```json
{ "success": true, "message": "User promoted to admin." }
```
```json
{ "success": false, "message": "Only owner can promote members." }
```
```json
{ "detail": "Owner role cannot be modified." }
```

---

## Posts + Feed

Media note:
- `video_url` is optional URL metadata only
- backend v1 does not implement file upload, transcoding, or media storage

### GET `/api/posts/`
Paginated list (`success/count/next/previous/results`) of non-deleted posts.

### POST `/api/posts/`
Creates post for authenticated creator.

### DELETE `/api/posts/{post_id}/`
Soft-delete response:
```json
{ "success": true }
```

### POST `/api/posts/restore/{post_id}/`
Restore soft-deleted post:
```json
{ "success": true }
```

### POST `/api/posts/{post_id}/like/`
### POST `/api/posts/{post_id}/share/`
### POST `/api/posts/{post_id}/skip/`
Responses:
```json
{ "success": true }
```

### GET `/api/feed/`
Response:
```json
{
  "success": true,
  "count": 5,
  "results": [
    {
      "id": 1,
      "creator": "dan",
      "game": "Apex Legends",
      "title": "Ranked clutch",
      "description": "1v3 final circle",
      "video_url": "",
      "created_at": "...",
      "feed_meta": {
        "reasons": ["recent", "game_interest"],
        "signals": { "likes": 0, "shares": 0, "comments": 0 },
        "source": "posts"
      }
    }
  ]
}
```

### GET `/api/feed/explain/{post_id}/`
Response:
```json
{
  "success": true,
  "data": {
    "post_id": 1,
    "score": 7,
    "reasons": ["recent", "friend_post"],
    "signals": { "likes": 3, "shares": 1, "comments": 0 }
  }
}
```

### POST `/api/interactions/`
Request:
```json
{ "post": 1, "interaction_type": "comment" }
```
Response:
```json
{
  "success": true,
  "created": true,
  "data": {
    "id": 10,
    "post": 1,
    "interaction_type": "comment",
    "created_at": "..."
  }
}
```

### POST `/api/share/{post_id}/{user_id}/`
Direct share response:
```json
{ "success": true }
```

---

## Friends / Connections

### POST `/api/connections/add/{user_id}/`
### POST `/api/friends/add/{user_id}/` (legacy alias)
### POST `/api/friends/request/{user_id}/`
Responses:
```json
{ "success": true, "message": "Friend request sent." }
```
```json
{ "success": true, "message": "Request already exists." }
```

### POST `/api/connections/accept/{connection_id}/`
### POST `/api/friends/accept/{connection_id}/` (legacy alias)
### POST `/api/friends/request/{connection_id}/accept/`
Response:
```json
{ "success": true, "message": "Friend request accepted." }
```

### GET `/api/connections/friends/`
### GET `/api/friends/friends/`
### GET `/api/friends/`
Response:
```json
{
  "success": true,
  "count": 1,
  "results": [
    {
      "id": 1,
      "sender": "dan",
      "receiver": "zan",
      "status": "accepted",
      "created_at": "..."
    }
  ]
}
```

---

## Notifications

### GET `/api/notifications/`
Response:
```json
{
  "success": true,
  "count": 1,
  "results": [
    {
      "actor": "zan",
      "type": "friend_request",
      "post_id": null,
      "conversation_id": null,
      "message_id": null,
      "is_read": false,
      "created_at": "..."
    }
  ]
}
```

Supported `type` values currently emitted:
- `like`
- `comment`
- `share`
- `friend_request`
- `friend_accept`
- `message`

---

## Messages (DM / Conversations)

### GET `/api/messages/conversations/`
Response:
```json
{
  "success": true,
  "count": 1,
  "results": [
    {
      "conversation_id": 1,
      "thread_id": 1,
      "type": "direct",
      "participants": ["zan"],
      "last_message": "yo wanna play ranked?",
      "last_message_at": "...",
      "unread": 2
    }
  ]
}
```

### POST `/api/messages/conversations/`
Creates or returns existing 1:1 direct conversation.
Request:
```json
{ "user_id": 2 }
```
Response:
```json
{
  "success": true,
  "data": { "conversation_id": 1, "thread_id": 1, "created": true }
}
```

### GET `/api/messages/conversations/{conversation_id}/messages/`
Returns message history and marks read pointer.

### POST `/api/messages/conversations/{conversation_id}/messages/`
Request:
```json
{ "content": "yo wanna play ranked?" }
```
Response:
```json
{ "success": true, "data": { "message_id": 42 } }
```

### POST `/api/messages/conversations/{conversation_id}/read/`
Response:
```json
{ "success": true, "data": { "last_read_message_id": 42 } }
```

Message history response:
Response:
```json
{
  "success": true,
  "count": 1,
  "results": [
    {
      "id": 42,
      "sender_id": 1,
      "sender": "dan",
      "body": "yo wanna play ranked?",
      "content": "yo wanna play ranked?",
      "message_type": "text",
      "is_deleted": false,
      "created_at": "...",
      "edited_at": null,
      "deleted_at": null
    }
  ]
}
```

Legacy aliases (kept for frontend compatibility):
- `GET /api/messages/threads/`
- `POST /api/messages/thread/{user_id}/`
- `POST /api/messages/send/{thread_id}/`
- `GET /api/messages/messages/{thread_id}/`

---

## Rate Limiting

Configured globally:
- `anon`: `100/day`
- `user`: `1000/day`
- `login`: `10/min`

Throttle response:
```json
{ "detail": "Request was throttled." }
```

---

## Notes

- Keep trailing slashes in routes.
- For Postman, set bearer token in Headers/Auth tab (not request body).
- API response convention is now normalized around:
  - list: `{ "success": true, "count": n, "results": [...] }`
  - single: `{ "success": true, "data": {...} }`
  - action: `{ "success": true|false, "message": "..." }`
