"""Throttle classes for messaging endpoints."""

from rest_framework.throttling import SimpleRateThrottle


class MessageSendThrottle(SimpleRateThrottle):
    """Limit how often one client can send direct messages."""

    scope = "message_send"

    def get_cache_key(self, request, view):
        """Throttle by requester identity to slow spam bursts."""
        return self.get_ident(request)
