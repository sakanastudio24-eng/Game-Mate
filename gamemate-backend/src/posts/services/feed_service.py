from django.db.models import Count, Q
from posts.models import Post


# Service object for feed ranking and metadata assembly.
class FeedService:
    """Build ranked post lists from interaction signals for feed consumption."""

    # Main feed builder used by FeedView.
    @staticmethod
    def get_feed(user, limit=20):
        """Return top posts ranked by engagement score with recency pre-filtering."""
        user_profile = getattr(user, "profile", None)
        favorite_games = (user_profile.favorite_games or []) if user_profile else []
        favorite_games = {
            game.strip().lower()
            for game in favorite_games
            if isinstance(game, str) and game.strip()
        }

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
            score = 0
            reasons = []

            # recency signal
            score += 1
            reasons.append("recent")

            # like signal
            if post.like_count >= 1:
                score += 2
                reasons.append("popular")

            # share signal
            if post.share_count >= 1:
                score += 3
                reasons.append("shared")

            # skip signal
            if post.skip_count >= 1:
                score -= 2

            feed_meta = {
                "score": score,
                "reasons": reasons,
                "signals": {
                    "likes": post.like_count,
                    "shares": post.share_count,
                    "comments": post.comment_count if hasattr(post, "comment_count") else 0,
                },
            }

            # category / game interest
            post_game_key = (post.game or "").strip().lower()
            if post_game_key in favorite_games:
                score += 3
                feed_meta["reasons"].append("game_interest")
                feed_meta["score"] = score

            ranked_posts.append((score, post, feed_meta))

        ranked_posts.sort(key=lambda x: x[0], reverse=True)

        selected = []
        games_seen = set()

        for score, post, meta in ranked_posts:
            # Prevent a single game category from dominating top feed slots.
            if post.game in games_seen:
                continue

            selected.append({
                "post": post,
                "meta": meta,
            })
            games_seen.add(post.game)

            if len(selected) >= limit:
                break

        return selected
