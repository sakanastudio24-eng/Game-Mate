from django.conf import settings
from django.db import models


# Persistent event stream for important user actions.
class Activity(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="activity_events",
    )
    type = models.CharField(max_length=50)
    object_id = models.IntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        """Return compact label for admin/debug output."""
        return f"{self.user.username} - {self.type}"
