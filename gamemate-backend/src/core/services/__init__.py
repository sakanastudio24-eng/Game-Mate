"""Service-layer helpers for cross-domain backend behavior."""

from .event_service import EVENT_LIMITS, allow_event

__all__ = ["EVENT_LIMITS", "allow_event"]
