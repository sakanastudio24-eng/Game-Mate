# Recommendation API Handoff (GameMate)

## Scope
This contract supports:
- Feed recommendation search
- Feed video search ranking and metadata enrichment
- Groups swipe recommendations
- Tag suggestions for query input
- Search autocomplete suggestions
- Intro message drafting for group joins

Frontend source of truth: `src/ai/advisorClient.ts`.
Canonical backend contract: `docs/FLOWS_BACKEND.md`.

## Base URL + Versioning
- Base URL: `EXPO_PUBLIC_API_BASE_URL`
- Current path prefix: `/api/ai`
- Versioning recommendation: keep v1 under `/api/ai/*` for now, introduce `/api/v2/ai/*` only on breaking changes.

## Endpoints

### 1) POST `/api/ai/recommendations`

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

Validation + limits expected by client:
- `groups.length <= 50`
- `userProfile.games` normalized to lowercase
- `tags` normalized to lowercase, trimmed, deduped
- `score` clamped to `0..100`
- `reasons` max 3 strings per result

### 1.1) POST `/api/ai/video-recommendations` (Search surface)

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

Validation + limits expected by client:
- `limit` defaults to `10`, max `20`
- top 2 sorted by `aiScore` are AI picks
- remaining sorted by `baseSearchScore`
- client shows AI badge only on page 1 top 2 cards

### 2) POST `/api/ai/suggested-tags`

Request:
```json
{
  "text": "need chill ranked teammates with mic"
}
```

Response:
```json
{
  "tags": ["chill", "ranked", "mic"]
}
```

Validation + limits expected by client:
- `text.length <= 500`
- lowercase + tokenized suggestions
- default fallback tags when no strong match

### 2.1) GET `/api/ai/autocomplete` (optional in v1, preferred for v1.1)

Query:
- `q` required
- `limit` optional, default 6, max 10

Response:
```json
{
  "items": ["ranked duo", "ranked scrim", "ranked chill"]
}
```

Validation + limits expected by client:
- minimum query length: 1
- items must be unique, non-empty, and trimmed
- return quickly enough for debounced typing UX (`<200ms` target P95)

### 3) POST `/api/ai/draft-intro`

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

## Error Shape (all endpoints)

HTTP statuses:
- `400` invalid payload
- `401` unauthorized
- `403` forbidden
- `429` rate-limited
- `500` internal error

Error body:
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "groups must be an array",
    "details": "groups[0].id is required"
  }
}
```

## Rate Limit Expectations
- Recommendations: `30 req/min/user`
- Tag suggestions: `60 req/min/user`
- Autocomplete: `120 req/min/user`
- Intro drafting: `30 req/min/user`
- On `429`, frontend keeps local fallback behavior for recommendations.

## Runtime Strategy (agreed)
- Direction: **v1 backend-first** scoring/recommendations.
- Client fallback: if backend unavailable or invalid response, client computes local recommendations and keeps UI functional.
- Search autocomplete fallback: local titles/authors/categories + local recent searches.
- Feature behavior should never block navigation or group joining.

## Privacy + Data Handling Constraints
- Do not store raw chat logs for these endpoints.
- Do not retain full user profile history beyond request processing unless explicitly required for analytics.
- Store only minimal telemetry needed for quality/debugging (latency, error rate, model/version ID, anonymous request size).
- Redact PII from logs.
- Enforce HTTPS/TLS in all environments.

## Frontend Integration Notes
- Feed search icon routes to `/(tabs)/ai-advisor`.
- Groups swipe card icon opens recommendation swipe panel and supports pass/join.
- Video search surface is fixed-header + 2-column infinite vertical grid.
- Result cards route to `/(tabs)/video-preview`.
- Canonical frontend contract types:
  - `AIUserProfile`
  - `AIGroupCandidate`
  - `AIRecommendationsRequest`
  - `AIRecommendationsResponse`
  - `AIApiError`

## Offline + UX Guarantees (Client Side)

- Never render a blank search screen:
  - show skeleton on load
  - show explicit error/empty states
- Preserve recent searches and continue surface using `useLocalCache`.
- Full offline persistence is guaranteed when `@react-native-async-storage/async-storage` is installed.
