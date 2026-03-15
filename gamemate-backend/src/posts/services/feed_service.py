import random

from django.db.models import Count, Q

from posts.models import Post
from posts.services.cache_service import (
    get_cached_like_counts,
    get_cached_trending_post_ids,
)
from posts.services.scoring_service import build_scoring_context, calculate_post_score


# Service object for feed ranking and metadata assembly.
class FeedService:
    """Build ranked post lists from interaction signals for feed consumption."""

    # Main feed builder used by FeedView.
    @staticmethod
    def get_feed(user, limit=20):
        """Return top posts ranked by engagement score with recency pre-filtering."""
        context = build_scoring_context(user)

        # Candidate layer (v1): collect post candidates only.
        post_candidates = FeedService._collect_post_candidates()
        candidates = list(post_candidates)

        ranked_candidates = []
        for candidate in candidates:
            post = candidate["post"]
            score, reasons = calculate_post_score(post, context)
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
        trending_post_ids = get_cached_trending_post_ids(limit=80)

        posts_qs = (
            Post.objects.filter(is_deleted=False)
            .annotate(
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
        )

        if trending_post_ids:
            # Preserve cached ordering so hot-post caching stays useful during ranking.
            posts_by_id = {post.id: post for post in posts_qs.filter(id__in=trending_post_ids)}
            posts = [posts_by_id[post_id] for post_id in trending_post_ids if post_id in posts_by_id]
        else:
            # Fallback path keeps feed alive even when cache is cold or missing.
            posts = list(posts_qs.order_by("-created_at")[:80])

        if not posts:
            return []

        like_counts = get_cached_like_counts([post.id for post in posts])

        for post in posts:
            # Attach computed counts directly so scoring does not repeat aggregate work.
            post.like_count = int(like_counts.get(post.id, 0))
            post.share_count = int(getattr(post, "share_count", 0))
            post.skip_count = int(getattr(post, "skip_count", 0))
            post.comment_count = int(getattr(post, "comment_count", 0))

        return [
            {
                "type": "post",
                "source": "posts",
                "post": post,
                "signals": {
                    "likes": post.like_count,
                    "shares": post.share_count,
                    "comments": post.comment_count,
                },
            }
            for post in posts
        ]

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
                    # Penalize repeated recent games instead of hard-filtering them out.
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

                # Explore slots intentionally ignore personalized score to add discovery.
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
