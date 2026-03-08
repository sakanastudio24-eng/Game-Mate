# `posts/` Folder Overview

Purpose: Feed content foundation (posts + interaction signals + ranked feed output).

## Definition Notes
- Stores feed posts and engagement events.
- Exposes CRUD endpoints for posts and interactions.
- Exposes `/api/feed/` via ranking service with safe metadata.
- Keeps ranking internals server-side while returning explainable reasons.

## Class Notes
- `Post` (`models.py`): creator-owned content entity (`game`, `title`, `description`, `video_url`).
- `PostInteraction` (`models.py`): engagement event (`like/comment/share/skip`) with uniqueness guard.
- `PostSerializer` (`serializers.py`): serializes post payloads.
- `PostInteractionSerializer` (`serializers_interaction.py`): serializes interaction payloads.
- `PostViewSet` (`views.py`): post CRUD + like/share/skip actions.
- `PostInteractionViewSet` (`views.py`): interaction create/list endpoints (scoped to current user).
- `FeedView` (`views.py`): ranked feed endpoint returning post + `feed_meta`.
- `PostsConfig` (`apps.py`): app boot configuration.

## Service Notes
- `FeedService` (`services/feed_service.py`): ranks posts, applies diversity filtering, and returns per-item metadata.

## File map
- `models.py`, `serializers.py`, `serializers_interaction.py`, `views.py`, `urls.py`, `admin.py`, `services/`, `migrations/`.
