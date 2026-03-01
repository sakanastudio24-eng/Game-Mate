# Recommendation API Handoff (GameMate)

## Scope
This contract supports:
- Feed recommendation search
- Groups swipe recommendations
- Tag suggestions for query input
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
- Intro drafting: `30 req/min/user`
- On `429`, frontend keeps local fallback behavior for recommendations.

## Runtime Strategy (agreed)
- Direction: **v1 backend-first** scoring/recommendations.
- Client fallback: if backend unavailable or invalid response, client computes local recommendations and keeps UI functional.
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
- Canonical frontend contract types:
  - `AIUserProfile`
  - `AIGroupCandidate`
  - `AIRecommendationsRequest`
  - `AIRecommendationsResponse`
  - `AIApiError`
