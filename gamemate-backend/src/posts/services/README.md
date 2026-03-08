# `posts/services/` Folder Overview

Purpose: Service-layer feed logic kept separate from HTTP view concerns.

## Definition Notes
- Contains ranking/retrieval logic used by feed endpoints.
- Keeps algorithm internals isolated from serializer/view layers.
- Returns structured feed items (`post` + `meta`) for response assembly.

## Class Notes
- `FeedService` (`feed_service.py`): static service for candidate scoring, reason tagging, and diversity filtering.

## Function Notes
- `FeedService.get_feed(user, limit=20)`: builds feed candidates, computes score/signals/reasons, applies diversity constraints, and returns selected items.
