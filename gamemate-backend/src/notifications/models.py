"""Notification model used for user-specific activity alerts."""

from django.conf import settings
from django.db import models


# Notification event delivered to a target user.
class Notification(models.Model):
    """Stores one notification event and optional navigation metadata."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="actions",
    )
    type = models.CharField(max_length=50)
    post_id = models.IntegerField(null=True, blank=True)
    conversation_id = models.IntegerField(null=True, blank=True)
    message_id = models.IntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        """Return readable label for admin/debug output."""
        return f"{self.actor.username} -> {self.user.username} ({self.type})"
