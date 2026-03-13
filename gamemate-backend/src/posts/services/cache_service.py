"""Partial caching helpers used by feed ranking and social lookups."""

from collections.abc import Iterable

from django.core.cache import cache
from django.db.models import Count, Q

from connections.models import Connection
from posts.models import Post, PostInteraction

FRIEND_IDS_CACHE_TTL_SECONDS = 300
LIKE_COUNT_CACHE_TTL_SECONDS = 120
TRENDING_POST_IDS_CACHE_TTL_SECONDS = 120

TRENDING_POST_IDS_CACHE_KEY = "feed:trending:post_ids"


def friend_ids_cache_key(user_id: int) -> str:
    """Build cache key for one user's accepted friend id set."""

    return f"feed:user:{user_id}:friend_ids"


def like_count_cache_key(post_id: int) -> str:
    """Build cache key for one post's like counter."""

    return f"feed:post:{post_id}:like_count"


def get_cached_friend_ids(user_id: int) -> set[int]:
    """Return cached friend ids or compute and cache them from connection graph."""

    cache_key = friend_ids_cache_key(user_id)
    cached_ids = cache.get(cache_key)
    if isinstance(cached_ids, list):
        return {int(value) for value in cached_ids}

    accepted = Connection.objects.filter(status="accepted").filter(
        Q(sender_id=user_id) | Q(receiver_id=user_id)
    )

    friend_ids: set[int] = set()
    for connection in accepted:
        if connection.sender_id == user_id:
            friend_ids.add(connection.receiver_id)
        elif connection.receiver_id == user_id:
            friend_ids.add(connection.sender_id)

    cache.set(cache_key, sorted(friend_ids), timeout=FRIEND_IDS_CACHE_TTL_SECONDS)
    return friend_ids


def invalidate_friend_ids_cache(user_id: int) -> None:
    """Drop cached friend-id set for one user."""

    cache.delete(friend_ids_cache_key(user_id))


def get_cached_like_counts(post_ids: Iterable[int]) -> dict[int, int]:
    """Resolve like counts via cache-first lookup with DB backfill."""

    unique_ids = list(dict.fromkeys(int(post_id) for post_id in post_ids))
    if not unique_ids:
        return {}

    keys_by_post_id = {post_id: like_count_cache_key(post_id) for post_id in unique_ids}
    cached_values = cache.get_many(keys_by_post_id.values())

    counts: dict[int, int] = {}
    missing_post_ids: list[int] = []

    for post_id, cache_key in keys_by_post_id.items():
        if cache_key in cached_values:
            counts[post_id] = int(cached_values[cache_key])
        else:
            missing_post_ids.append(post_id)

    if missing_post_ids:
        rows = (
            PostInteraction.objects.filter(
                post_id__in=missing_post_ids,
                interaction_type="like",
            )
            .values("post_id")
            .annotate(total=Count("id"))
        )
        db_counts = {int(row["post_id"]): int(row["total"]) for row in rows}

        set_many_payload: dict[str, int] = {}
        for post_id in missing_post_ids:
            count = int(db_counts.get(post_id, 0))
            counts[post_id] = count
            set_many_payload[like_count_cache_key(post_id)] = count

        if set_many_payload:
            cache.set_many(set_many_payload, timeout=LIKE_COUNT_CACHE_TTL_SECONDS)

    return counts


def invalidate_like_count_cache(post_id: int) -> None:
    """Drop cached like count for one post."""

    cache.delete(like_count_cache_key(post_id))


def get_cached_trending_post_ids(limit: int = 80) -> list[int]:
    """Return cached trending post ids or recompute from recent engagement signals."""

    cached_ids = cache.get(TRENDING_POST_IDS_CACHE_KEY)
    if isinstance(cached_ids, list) and cached_ids:
        return [int(value) for value in cached_ids[:limit]]

    posts = (
        Post.objects.filter(is_deleted=False)
        .annotate(
            like_count=Count(
                "interactions",
                filter=Q(interactions__interaction_type="like"),
            ),
            share_count=Count(
                "interactions",
                filter=Q(interactions__interaction_type="share"),
            ),
            skip_count=Count(
                "interactions",
                filter=Q(interactions__interaction_type="skip"),
            ),
        )
        .order_by("-created_at")[:240]
    )

    scored_posts = []
    for post in posts:
        score = (int(post.like_count) * 3) + (int(post.share_count) * 5) - (int(post.skip_count) * 2)
        scored_posts.append((score, post.created_at, post.id))

    scored_posts.sort(key=lambda value: (value[0], value[1]), reverse=True)
    ordered_ids = [post_id for _, _, post_id in scored_posts[:limit]]

    cache.set(
        TRENDING_POST_IDS_CACHE_KEY,
        ordered_ids,
        timeout=TRENDING_POST_IDS_CACHE_TTL_SECONDS,
    )
    return ordered_ids


def invalidate_trending_post_ids_cache() -> None:
    """Drop cached trending post-id list."""

    cache.delete(TRENDING_POST_IDS_CACHE_KEY)
