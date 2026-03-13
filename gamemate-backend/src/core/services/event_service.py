"""In-memory event throttling utilities used by signal handlers."""

import logging
import threading
import time

logger = logging.getLogger(__name__)

# Per-event limits in the shape: event_type -> (limit, window_seconds).
EVENT_LIMITS = {
    "like": (10, 60),
    "comment": (20, 60),
    "share": (15, 60),
    "message": (30, 60),
    "friend_request": (5, 60),
}

# In-memory timestamp buckets keyed by "user_id:event_type".
event_cache: dict[str, list[float]] = {}
event_cache_lock = threading.Lock()


# Decide whether an event should be processed under configured per-user limits.
def allow_event(user_id, event_type):
    """Return True when user/event is under configured rate threshold."""

    limit, window = EVENT_LIMITS.get(event_type, (50, 60))
    key = f"{user_id}:{event_type}"
    now = time.time()

    with event_cache_lock:
        timestamps = event_cache.get(key, [])
        timestamps = [timestamp for timestamp in timestamps if now - timestamp < window]

        if len(timestamps) >= limit:
            logger.warning("Rate limit hit: user_id=%s event_type=%s", user_id, event_type)
            event_cache[key] = timestamps
            return False

        timestamps.append(now)
        event_cache[key] = timestamps
        return True
