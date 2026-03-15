from rest_framework.throttling import SimpleRateThrottle


# Throttle class for login endpoint abuse protection.
class LoginThrottle(SimpleRateThrottle):
    """Throttle login attempts per client IP to reduce brute-force risk."""

    scope = "login"

    # Use request IP as cache key for login rate limits.
    def get_cache_key(self, request, view):
        """Use requester IP as the throttling identity key."""
        return self.get_ident(request)


# Throttle class for signup endpoint abuse protection.
class SignupThrottle(SimpleRateThrottle):
    """Throttle account creation attempts per client IP."""

    scope = "signup"

    def get_cache_key(self, request, view):
        """Use requester IP as the throttling identity key."""
        return self.get_ident(request)
