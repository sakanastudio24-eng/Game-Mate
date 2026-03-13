from dataclasses import dataclass

from posts.services.cache_service import get_cached_friend_ids


# Immutable scoring context reused across candidate scoring calls.
@dataclass(frozen=True)
class FeedScoringContext:
    favorite_games: set[str]
    friend_ids: set[int]


# Build user-specific scoring context for feed ranking.
def build_scoring_context(user) -> FeedScoringContext:
    user_profile = getattr(user, "profile", None)
    favorite_games = (user_profile.favorite_games or []) if user_profile else []
    normalized_games = {
        game.strip().lower()
        for game in favorite_games
        if isinstance(game, str) and game.strip()
    }

    friend_ids = get_cached_friend_ids(user.id)

    return FeedScoringContext(
        favorite_games=normalized_games,
        friend_ids=friend_ids,
    )


# Calculate rank score and reason tags for a single post candidate.
def calculate_post_score(post, context: FeedScoringContext) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []

    like_count = getattr(post, "like_count", 0)
    share_count = getattr(post, "share_count", 0)
    skip_count = getattr(post, "skip_count", 0)

    # Recency base signal.
    score += 1
    reasons.append("recent")

    # Engagement signals.
    if like_count >= 1:
        score += 2
        reasons.append("popular")

    if share_count >= 1:
        score += 3
        reasons.append("shared")

    if skip_count >= 1:
        score -= 2

    # Preference and graph signals.
    post_game_key = (post.game or "").strip().lower()
    if post_game_key in context.favorite_games:
        score += 3
        reasons.append("game_interest")

    if post.creator_id in context.friend_ids:
        score += 3
        reasons.append("friend_post")

    return score, reasons
