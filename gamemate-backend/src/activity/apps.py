"""Activity app configuration."""

from django.apps import AppConfig


class ActivityConfig(AppConfig):
    """Django app config for activity module."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "activity"
