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
        recent_games = []
        remaining = [
            {"score": score, "post": post, "meta": meta}
            for score, post, meta in ranked_posts
        ]

        while remaining and len(selected) < limit:
            best_index = 0
            best_effective_score = None

            # Greedy pick: apply a diversity penalty if this game was recently shown.
            for idx, candidate in enumerate(remaining):
                effective_score = candidate["score"]
                if candidate["post"].game in recent_games:
                    effective_score -= 2

                if best_effective_score is None or effective_score > best_effective_score:
                    best_effective_score = effective_score
                    best_index = idx

            chosen = remaining.pop(best_index)
            chosen_meta = {
                **chosen["meta"],
                "score": best_effective_score,
                "reasons": list(chosen["meta"].get("reasons", [])),
            }

            if chosen["post"].game in recent_games:
                chosen_meta["reasons"].append("diversity_penalty")

            selected.append(
                {
                    "post": chosen["post"],
                    "meta": chosen_meta,
                }
            )

            recent_games.append(chosen["post"].game)
            recent_games = recent_games[-3:]

        return selected
