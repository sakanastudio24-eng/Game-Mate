from django.db.models import Count, Q

from posts.models import Post
from posts.services.scoring_service import build_scoring_context, calculate_post_score


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

    context = build_scoring_context(user)
    score, reasons = calculate_post_score(annotated_post, context)
    signals = {
        "likes": annotated_post.like_count,
        "shares": annotated_post.share_count,
        "comments": annotated_post.comment_count,
        "skips": annotated_post.skip_count,
    }
    return score, reasons, signals
