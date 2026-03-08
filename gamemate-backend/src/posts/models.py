from django.conf import settings
from django.db import models


# Feed content model authored by users.
class Post(models.Model):
    """Feed post entity containing creator metadata and optional video content."""

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    game = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        """Return compact label for admin/debug displays."""
        return f"{self.title} - {self.creator.username}"


# Interaction event model used for feed ranking signals.
class PostInteraction(models.Model):
    """Tracks user engagement signals that feed ranking and recommendation logic."""

    INTERACTION_TYPES = (
        ("like", "Like"),
        ("comment", "Comment"),
        ("share", "Share"),
        ("skip", "Skip"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="interactions",
    )
    interaction_type = models.CharField(max_length=10, choices=INTERACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post", "interaction_type")
