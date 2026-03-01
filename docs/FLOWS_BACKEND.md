# Backend API Contracts + Handoff (v1)

Last updated: 2026-03-01
Owner: Mobile + Backend handoff

This is the canonical backend contract for the current Expo app state.

## 1) Scope

Covers all backend integration required for:
- Feed (posts, engagement, reporting, comments)
- Groups (discover, detail, create, join/leave, report/share)
- Recommendation search + group swipe scoring
- Video search ranking and autocomplete
- Social (friends, requests, player search, user profile)
- Messages, notifications, QR, account/settings
- Platform connections and platform presence sync

Frontend references:
- `app/(tabs)/*`
- `src/ai/advisorClient.ts`

## 2) API Conventions

### Base URL and versioning
- Base URL from mobile env: `EXPO_PUBLIC_API_BASE_URL`
- Current namespace: `/api`
- Breaking changes: introduce `/api/v2/*`.

### Auth
- Header: `Authorization: Bearer <token>`
- Endpoints marked `public` do not require auth.

### Content types
- Request: `Content-Type: application/json`
- Response: `application/json`

### IDs and timestamps
- IDs are opaque strings (UUID/ULID acceptable).
- Timestamps use ISO-8601 UTC (example: `2026-02-28T17:20:00Z`).

### Pagination
- Cursor pagination for lists where possible.
- Request fields: `limit`, `cursor`
- Response fields: `nextCursor`, `hasMore`

### Standard error contract

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "groups[0].id is required",
    "details": "Field 'id' cannot be empty",
    "requestId": "req_01J..."
  }
}
```

### Standard status codes
- `200` success
- `201` created
- `400` invalid input
- `401` unauthorized
- `403` forbidden
- `404` not found
- `409` conflict
- `422` semantic validation failed
- `429` rate-limited
- `500` server error

## 3) Endpoint Matrix (Feature -> Route)

### Auth + Account
- `POST /api/auth/signup` (public)
- `POST /api/auth/login` (public)
- `POST /api/auth/social-login` (public)
- `GET /api/me`
- `PATCH /api/me`
- `DELETE /api/me`
- `POST /api/users/password/change`
- `POST /api/users/email/send-verify`
- `POST /api/users/phone/verify`

### Preferences + Settings
- `GET /api/me/notifications`
- `PATCH /api/me/privacy`
- `PATCH /api/me/notifications`
- `GET /api/me/platform-connections`
- `PATCH /api/me/platform-connections`

### Feed
- `GET /api/posts`
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/share`
- `POST /api/posts/:id/save`
- `POST /api/posts/:id/report`
- `GET /api/posts/:id/comments`
- `POST /api/posts/:id/comments`

### Groups
- `GET /api/groups`
- `GET /api/groups/discover`
- `POST /api/groups`
- `GET /api/groups/:id`
- `POST /api/groups/:id/join`
- `POST /api/groups/:id/leave`
- `POST /api/groups/:id/report`

### Recommendations (Search + Group Swipe)
- `POST /api/ai/recommendations`
- `POST /api/ai/video-recommendations`
- `POST /api/ai/suggested-tags`
- `GET /api/ai/autocomplete`
- `POST /api/ai/draft-intro`

### Social
- `GET /api/friends`
- `GET /api/friends/requests`
- `POST /api/friends/request/:userId`
- `POST /api/friends/accept/:userId`
- `POST /api/friends/reject/:userId`
- `GET /api/players/search`
- `GET /api/users/:userId`

### Messaging
- `GET /api/messages/conversations`
- `GET /api/messages/:userId`
- `POST /api/messages/:userId`

### Notifications
- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `DELETE /api/notifications/:id`

### QR
- `GET /api/qr/my-code`
- `PATCH /api/qr/my-code`
- `GET /api/qr/scan?code=...`

## 4) Detailed Contracts (P0)

P0 means needed first for current mobile behavior parity.

### 4.1 Recommendations

#### POST `/api/ai/recommendations`

Request:
```json
{
  "userProfile": {
    "games": ["valorant"],
    "rank": "gold",
    "mic": true,
    "tags": ["casual", "teamplay"]
  },
  "groups": [
    {
      "id": "g1",
      "game": "valorant",
      "rankMin": "silver",
      "rankMax": "platinum",
      "tags": ["casual", "mic"],
      "slots": 2,
      "micRequired": true
    }
  ]
}
```

Response:
```json
{
  "results": [
    {
      "groupId": "g1",
      "score": 87,
      "reasons": ["Rank match", "Mic-on", "Casual vibe"]
    }
  ]
}
```

Validation constraints:
- `groups.length <= 50`
- `score` in `0..100`
- `reasons.length <= 3`
- tags normalized (trim/lowercase)

Rate limit:
- `30 req/min/user`

#### POST `/api/ai/video-recommendations`

Request:
```json
{
  "query": "ranked duo no mic",
  "filters": ["fyp", "esports"],
  "limit": 10
}
```

Response:
```json
{
  "results": [
    {
      "videoId": "n1",
      "baseSearchScore": 88,
      "aiScore": 92,
      "isAiPick": true
    }
  ]
}
```

Constraints:
- `limit` default 10, max 20
- top 2 by `aiScore` are AI picks
- remaining sorted by `baseSearchScore`

Rate limit:
- `30 req/min/user`

#### POST `/api/ai/suggested-tags`

Request:
```json
{ "text": "need chill ranked teammates with mic" }
```

Response:
```json
{ "tags": ["chill", "ranked", "mic"] }
```

Constraints:
- `text.length <= 500`
- return up to 6 tags

#### GET `/api/ai/autocomplete`

Query:
- `q` required (1..500 chars)
- `limit` optional, default 6, max 10

Response:
```json
{
  "items": ["ranked duo", "ranked chill", "scrim tonight"]
}
```

Constraints:
- unique, trimmed strings only
- response target `<200ms` p95 for debounced typing UX

#### POST `/api/ai/draft-intro`

Request:
```json
{
  "userProfile": {
    "games": ["valorant"],
    "rank": "gold",
    "mic": true,
    "tags": ["casual", "teamplay"]
  },
  "group": {
    "id": "g1",
    "game": "valorant",
    "tags": ["casual", "mic"],
    "micRequired": true
  }
}
```

Response:
```json
{
  "message": "Hey team, I'm looking to join your valorant group. Current rank: gold. Mic is on and ready."
}
```

### 4.2 Groups

#### GET `/api/groups/discover`

Query:
- `q` optional search string
- `game` optional
- `limit` default 20
- `cursor` optional

Response:
```json
{
  "groups": [
    {
      "id": "s1",
      "name": "CS2 Pro League",
      "game": "Counter-Strike 2",
      "members": 156,
      "online": 89,
      "thumbnail": "https://..."
    }
  ],
  "nextCursor": "cur_02",
  "hasMore": true
}
```

#### POST `/api/groups/:id/join`

Response:
```json
{ "joined": true, "memberCount": 157 }
```

#### POST `/api/groups/:id/leave`

Response:
```json
{ "joined": false, "memberCount": 156 }
```

#### POST `/api/groups/:id/report`

Request:
```json
{ "reason": "spam", "notes": "optional" }
```

Response:
```json
{ "accepted": true }
```

### 4.3 Feed

#### GET `/api/posts`

Query:
- `category=fyp|esports|patches|streams` optional
- `game` optional (example: `valorant`)
- `hashtag` optional (example: `ranked`)
- `q` optional (title/author text query)
- `type` optional (`video|article`, default `video`)
- `limit` default 20
- `cursor` optional

Response:
```json
{
  "posts": [
    {
      "id": "p1",
      "type": "video",
      "title": "Disco 2024 Tournament Finals",
      "author": "ProGamingLeague",
      "date": "2026-08-25",
      "game": "valorant",
      "hashtags": ["ranked", "esports", "highlights"],
      "duration": "1:20",
      "thumbnail": "https://...",
      "likes": 1240,
      "comments": 89,
      "shares": 321,
      "category": "fyp"
    }
  ],
  "nextCursor": "cur_02",
  "hasMore": true
}
```

Required feed video fields for `type=video`:
- `id`
- `title`
- `author`
- `date`
- `game`
- `hashtags[]`
- `thumbnail`
- `likes`
- `comments`
- `shares`
- `category`

#### POST `/api/posts/:id/like`

Response:
```json
{ "liked": true, "likeCount": 1241 }
```

#### POST `/api/posts/:id/share`

Request:
```json
{
  "target": "friends|contacts|copy_link",
  "channel": "in_app|system_share"
}
```

Response:
```json
{
  "shared": true,
  "shareCount": 322
}
```

#### POST `/api/posts/:id/save`

Response:
```json
{ "saved": true, "saveCount": 450 }
```

#### POST `/api/posts/:id/report`

Request:
```json
{ "reason": "abuse", "notes": "optional" }
```

Response:
```json
{ "accepted": true }
```

### 4.4 Platform Connections

#### GET `/api/me/platform-connections`

Response:
```json
{
  "playstation": false,
  "computer": false,
  "phone": true,
  "switch": false,
  "syncPresence": true,
  "updatedAt": "2026-02-28T17:20:00Z"
}
```

#### PATCH `/api/me/platform-connections`

Request:
```json
{
  "playstation": true,
  "computer": true,
  "phone": true,
  "switch": false,
  "syncPresence": true
}
```

Response:
```json
{
  "playstation": true,
  "computer": true,
  "phone": true,
  "switch": false,
  "syncPresence": true,
  "updatedAt": "2026-02-28T17:21:00Z"
}
```

### 4.5 Notification Preferences

#### GET `/api/me/notifications`

Response:
```json
{
  "preset": "balanced",
  "deliveryFlow": "instant",
  "timeSheet": {
    "preset": "off",
    "quietStart": "00:00",
    "quietEnd": "00:00",
    "activeDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  "settings": {
    "friendRequests": true,
    "groupInvites": true,
    "messages": true,
    "friendActivity": true,
    "friendOnline": true,
    "matchmaking": true,
    "achievements": true
  },
  "updatedAt": "2026-03-01T18:20:00Z"
}
```

#### PATCH `/api/me/notifications`

Request:
```json
{
  "preset": "minimal",
  "deliveryFlow": "batch_30m",
  "timeSheet": {
    "preset": "night",
    "quietStart": "22:00",
    "quietEnd": "08:00",
    "activeDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  "settings": {
    "friendRequests": true,
    "groupInvites": true,
    "messages": true,
    "friendActivity": false,
    "friendOnline": false,
    "matchmaking": true,
    "achievements": false
  }
}
```

Response:
```json
{
  "preset": "minimal",
  "deliveryFlow": "batch_30m",
  "timeSheet": {
    "preset": "night",
    "quietStart": "22:00",
    "quietEnd": "08:00",
    "activeDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  "settings": {
    "friendRequests": true,
    "groupInvites": true,
    "messages": true,
    "friendActivity": false,
    "friendOnline": false,
    "matchmaking": true,
    "achievements": false
  },
  "updatedAt": "2026-03-01T18:21:00Z"
}
```

Validation constraints:
- `preset` enum: `minimal | balanced | all`
- `deliveryFlow` enum: `instant | batch_30m | hourly_digest`
- `timeSheet.preset` enum: `off | night | day | focus`
- `quietStart` and `quietEnd` must be `HH:mm` 24-hour format
- `activeDays` must contain values in `Mon..Sun`
- all keys in `settings` are required booleans

### 4.6 Account Deletion

#### DELETE `/api/me`

Request (optional hard-confirm):
```json
{
  "confirm": true
}
```

Response:
```json
{
  "accepted": true,
  "deletionRequestedAt": "2026-03-01T18:25:00Z"
}
```

Behavior:
- Endpoint must invalidate active sessions/tokens after acceptance.
- Return `202` if deletion is asynchronous; return `200` if immediate.
- Repeated calls should remain idempotent (`accepted: true` if already scheduled/deleted).

### 4.7 Social + Messaging

#### GET `/api/messages/conversations`

Response:
```json
{
  "conversations": [
    {
      "userId": "u2",
      "username": "NovaStrike",
      "avatar": "https://...",
      "lastMessage": "Queue tonight?",
      "timestamp": "2026-02-28T16:50:00Z",
      "unreadCount": 2
    }
  ]
}
```

#### GET `/api/messages/:userId`

Query:
- `limit` default 50
- `cursor` optional

Response:
```json
{
  "messages": [
    {
      "id": "m1",
      "senderId": "u2",
      "text": "Queue tonight?",
      "timestamp": "2026-02-28T16:50:00Z"
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

#### POST `/api/messages/:userId`

Request:
```json
{ "message": "I can play in 10 minutes." }
```

Response:
```json
{
  "id": "m2",
  "senderId": "me",
  "text": "I can play in 10 minutes.",
  "timestamp": "2026-02-28T16:52:00Z"
}
```

## 5) Client Behavior Contract (Must Preserve)

Backend responses must support these frontend behaviors:
- Recommendations cannot block UI. On backend failure, client falls back locally.
- Video search cannot block UI. On backend failure, client uses local ranking from seeded feed data.
- Group swipe always advances card after decision.
- Feed/list endpoints must tolerate repeated cursor requests.
- Join/leave endpoints should be idempotent for repeated taps.
- Search/tag endpoints must be resilient to noisy user text.
- Autocomplete should be safe to call frequently under debounce.

## 6) Rate Limits

Recommended defaults:
- Recommendations: `30 req/min/user`
- Video recommendations: `30 req/min/user`
- Suggested tags: `60 req/min/user`
- Autocomplete: `120 req/min/user`
- Feed shares: `60 req/min/user`
- Draft intro: `30 req/min/user`
- Feed + groups list: `120 req/min/user`
- Messaging send: `40 req/min/user`

On `429`:
- include `Retry-After`
- keep error contract above

## 7) Realtime (Phase C)

Not required for P0 build parity, but define channel names now:
- `messages:new`
- `groups:member_joined`
- `groups:member_left`
- `notifications:new`
- `friends:presence`

## 8) Backend Handoff Notes

### Implementation order
1. Auth + `/api/me` + settings endpoints (including notifications and account deletion)
2. Groups discover/detail/join/leave/report
3. Posts feed + engagement + report
4. Recommendation endpoints
5. Social + messaging + notifications
6. QR + secondary account endpoints

### Data and privacy constraints
- Do not store raw recommendation prompt text beyond required processing logs.
- Redact tokens/PII from structured logs.
- Store minimal analytics for recommendation quality (score distribution, latency, error rates).

### Definition of done (backend integration)
- All P0 endpoints respond with documented shape.
- Mobile can run with `EXPO_PUBLIC_API_BASE_URL` configured and no schema errors.
- Recommendation route works with backend and local fallback.
- Platform connections persist and reload correctly.
- Error and rate-limit envelopes match contract.
