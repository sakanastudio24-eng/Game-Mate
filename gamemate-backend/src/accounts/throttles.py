from rest_framework.throttling import SimpleRateThrottle


class LoginThrottle(SimpleRateThrottle):
    """Throttle login attempts per client IP to reduce brute-force risk."""

    scope = "login"

    def get_cache_key(self, request, view):
        """Use requester IP as the throttling identity key."""
        return self.get_ident(request)
