from django.apps import AppConfig


class MessagesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "messages"
    label = "dm_messages"

    def ready(self):
        """Register app signal handlers."""
        import messages.signals  # noqa: F401
