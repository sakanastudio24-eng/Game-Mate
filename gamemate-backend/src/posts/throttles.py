"""Throttle classes for post creation abuse protection."""

from rest_framework.throttling import SimpleRateThrottle


class PostCreateThrottle(SimpleRateThrottle):
    """Limit how often one client can create new posts."""

    scope = "post_create"

    def get_cache_key(self, request, view):
        """Throttle by requester identity to reduce bursty post spam."""
        return self.get_ident(request)
