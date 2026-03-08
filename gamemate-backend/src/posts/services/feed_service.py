import random

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

        # Candidate layer (v1): collect post candidates only.
        post_candidates = FeedService._collect_post_candidates()
        candidates = list(post_candidates)

        ranked_candidates = []
        for candidate in candidates:
            post = candidate["post"]
            score, reasons = FeedService._score_post_candidate(post, favorite_games)
            ranked_candidates.append(
                {
                    "score": score,
                    "post": post,
                    "meta": {
                        "type": candidate["type"],
                        "source": candidate["source"],
                        "score": score,
                        "reasons": reasons,
                        "signals": candidate["signals"],
                    },
                }
            )

        ranked_candidates.sort(key=lambda x: x["score"], reverse=True)
        personalized_items = FeedService._apply_diversity_penalty(ranked_candidates, limit)

        # Mix in one explore item every ~6 slots (5 personalized + 1 explore).
        mixed_items = FeedService._inject_explore_slots(personalized_items, post_candidates, limit)
        return mixed_items[:limit]

    @staticmethod
    def _collect_post_candidates():
        """Collect post candidates and attach source/type metadata."""
        posts = (
            Post.objects.annotate(
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
            .order_by("-created_at")[:80]
        )

        return [
            {
                "type": "post",
                "source": "posts",
                "post": post,
                "signals": {
                    "likes": post.like_count,
                    "shares": post.share_count,
                    "comments": post.comment_count if hasattr(post, "comment_count") else 0,
                },
            }
            for post in posts
        ]

    @staticmethod
    def _score_post_candidate(post, favorite_games):
        """Compute base score and reasons for a post candidate."""
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

        # category / game interest
        post_game_key = (post.game or "").strip().lower()
        if post_game_key in favorite_games:
            score += 3
            reasons.append("game_interest")

        return score, reasons

    @staticmethod
    def _apply_diversity_penalty(ranked_candidates, limit):
        """Apply soft recent-game penalty during selection to increase variety."""
        selected = []
        recent_games = []
        remaining = list(ranked_candidates)

        while remaining and len(selected) < limit:
            best_index = 0
            best_effective_score = None

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

            selected.append({"post": chosen["post"], "meta": chosen_meta})
            recent_games.append(chosen["post"].game)
            recent_games = recent_games[-3:]

        return selected

    @staticmethod
    def _inject_explore_slots(personalized_items, post_candidates, limit):
        """Inject one explore item every ~6 posts to prevent feed stagnation."""
        if not personalized_items:
            return []

        output = []
        used_post_ids = set()

        explore_pool = list(post_candidates)
        random.shuffle(explore_pool)

        personalized_count = 0
        for item in personalized_items:
            if len(output) >= limit:
                break

            output.append(item)
            used_post_ids.add(item["post"].id)
            personalized_count += 1

            should_insert_explore = personalized_count % 5 == 0
            if not should_insert_explore or len(output) >= limit:
                continue

            while explore_pool and len(output) < limit:
                candidate = explore_pool.pop()
                explore_post = candidate["post"]
                if explore_post.id in used_post_ids:
                    continue

                output.append(
                    {
                        "post": explore_post,
                        "meta": {
                            "type": candidate["type"],
                            "source": "explore_pool",
                            "score": 0,
                            "reasons": ["recent", "explore_slot"],
                            "signals": candidate["signals"],
                        },
                    }
                )
                used_post_ids.add(explore_post.id)
                break

        return output
