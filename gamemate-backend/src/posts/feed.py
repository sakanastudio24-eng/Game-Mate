from django.db.models import Count, Q

from posts.models import Post
from posts.services.feed_service import FeedService


def score_post(post, user):
    """Return score, reasons, and signals for a single post/user pair."""
    annotated_post = (
        Post.objects.filter(id=post.id, is_deleted=False)
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
            comment_count=Count(
                "interactions",
                filter=Q(interactions__interaction_type="comment"),
            ),
        )
        .first()
    )
    if not annotated_post:
        return 0, [], {"likes": 0, "shares": 0, "comments": 0, "skips": 0}

    user_profile = getattr(user, "profile", None)
    favorite_games = (user_profile.favorite_games or []) if user_profile else []
    favorite_games = {
        game.strip().lower()
        for game in favorite_games
        if isinstance(game, str) and game.strip()
    }

    friend_ids = FeedService._get_friend_ids(user)
    score, reasons = FeedService._score_post_candidate(annotated_post, favorite_games, friend_ids)
    signals = {
        "likes": annotated_post.like_count,
        "shares": annotated_post.share_count,
        "comments": annotated_post.comment_count,
        "skips": annotated_post.skip_count,
    }
    return score, reasons, signals
