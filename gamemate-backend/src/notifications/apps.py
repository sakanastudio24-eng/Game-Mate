"""Notifications app configuration."""

from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    """Django app config for notification domain."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "notifications"
