"""Throttle classes for connection request abuse protection."""

from rest_framework.throttling import SimpleRateThrottle


class FriendRequestThrottle(SimpleRateThrottle):
    """Limit how often one client can create outgoing friend requests."""

    scope = "friend_request"

    def get_cache_key(self, request, view):
        """Use requester identity so throttling works for both auth and anon paths."""
        return self.get_ident(request)
