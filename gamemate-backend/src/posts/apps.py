from django.apps import AppConfig


# AppConfig for posts/feed domain.
class PostsConfig(AppConfig):
    """App configuration for feed post and interaction models."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "posts"

    def ready(self):
        """Register app signal handlers."""
        import posts.signals  # noqa: F401
