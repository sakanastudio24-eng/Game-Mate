# Feed Flow (GameMate)

Last updated: 2026-03-13
Owner: Mobile + Backend integration

## Goal
Define the end-to-end feed flow so ranking behavior, explainability, and UI states are easy to review.

## User Flow
1. User opens app and lands on `/(tabs)/news`.
2. Mobile calls `GET /api/feed/` with JWT.
3. Backend returns ranked posts plus `feed_meta` (source/reasons/signals).
4. User can like/share/skip and open "Why this appeared".
5. User can pull-to-refresh and continue scrolling.

## Request Flow
1. `news.tsx` calls `listFeedPage(...)` from `services/posts.ts`.
2. Request resolves through shared `apiRequest(...)` helper and auth header.
3. `FeedView` in backend (`posts/views.py`) calls `FeedService.get_feed(request.user)`.
4. `FeedService` assembles ranked items and metadata.
5. API response returns:
   - `success`
   - `count`
   - `results[]` (post payload + `feed_meta`)

## Ranking Pipeline (Backend)
1. Build user scoring context:
   - normalized favorite games from profile
   - friend IDs from connection graph (cached)
2. Collect candidate posts:
   - non-deleted posts
   - engagement annotations (likes/shares/comments/skips)
   - partial cache usage for hot inputs
3. Score each candidate:
   - recency baseline
   - engagement weights
   - game interest match
   - friend-post boost
4. Apply diversity penalty:
   - down-weight repeated games in recent selected window
5. Inject explore slot:
   - periodic explore insertion to prevent stagnation

## Explainability Flow
1. User taps info icon in feed.
2. Mobile calls `GET /api/feed/explain/{post_id}/`.
3. Backend recomputes per-post scoring signals and returns reasons/signals.
4. UI shows reason labels without exposing raw scoring formula details.

## Interaction Flow
- Like: `POST /api/posts/{id}/like/`
- Share: `POST /api/posts/{id}/share/`
- Skip: `POST /api/posts/{id}/skip/`

Side effects:
- Signals update interaction rows.
- Cache keys invalidate where needed.
- Notification/activity events emit through signals and services.

## Caching (Partial)
Current partial cache strategy:
- friend IDs
- per-post like counts
- trending post IDs

Final score is still computed live per request using cached inputs plus current context.

## Mobile UI States
- Loading: initial skeleton/state while first feed fetch resolves
- Error: retry banner and retry action
- Empty: explicit empty message with recovery CTA
- Refresh: pull-to-refresh reloads first feed page
- Continue: infinite scrolling via next page or loop fallback

## Related Endpoints
- `GET /api/feed/`
- `GET /api/feed/explain/{post_id}/`
- `POST /api/posts/{id}/like/`
- `POST /api/posts/{id}/share/`
- `POST /api/posts/{id}/skip/`

