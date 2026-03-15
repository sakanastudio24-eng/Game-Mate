# Posts

Purpose:
- manage posts, feed ranking, feed explanations, and interaction signals

Key models:
- `Post`
- `PostInteraction`
- `PostShare`

Key responsibilities:
- post CRUD with owner-only mutation rules
- soft delete and restore
- feed generation and explainability
- like, unlike, share, and skip interaction tracking
- cache-aware invalidation for hot feed inputs

Notable files:
- `views.py`: post CRUD, feed, explain, and interaction endpoints
- `serializers.py`: trimmed payload validation
- `permissions.py`: owner-or-read-only post protection
- `throttles.py`: post creation rate limit
- `services/feed_service.py`: ranking entry point
