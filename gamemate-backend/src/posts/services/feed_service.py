from django.db.models import Count, Q
from posts.models import Post


class FeedService:
    """Build ranked post lists from interaction signals for feed consumption."""

    @staticmethod
    def get_feed(user, limit=20):
        """Return top posts ranked by engagement score with recency pre-filtering."""
        posts = (
            Post.objects
            .annotate(
                like_count=Count(
                    "interactions",
                    filter=Q(interactions__interaction_type="like")
                ),
                share_count=Count(
                    "interactions",
                    filter=Q(interactions__interaction_type="share")
                ),
                skip_count=Count(
                    "interactions",
                    filter=Q(interactions__interaction_type="skip")
                ),
            )
            .order_by("-created_at")[:50]
        )

        ranked_posts = []

        for post in posts:
            score = (
                post.like_count * 3 +
                post.share_count * 5 -
                post.skip_count * 2
            )

            feed_meta = {
                "score": score,
                "reasons": [],
                "signals": {
                    "likes": post.like_count,
                    "shares": post.share_count,
                    "comments": post.comment_count if hasattr(post, "comment_count") else 0,
                },
            }

            ranked_posts.append((score, post, feed_meta))

        ranked_posts.sort(key=lambda x: x[0], reverse=True)

        selected = []
        games_seen = set()

        for score, post, feed_meta in ranked_posts:
            # Prevent a single game category from dominating top feed slots.
            if post.game in games_seen:
                continue

            selected.append(post)
            games_seen.add(post.game)

            if len(selected) >= limit:
                break

        return selected
