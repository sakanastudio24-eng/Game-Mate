from django.apps import AppConfig


# AppConfig for groups domain and signal registration.
class GroupsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "groups"

    # Load signal module during Django app startup.
    def ready(self):
        """Load group signal registrations when Django starts the app."""
        import groups.signals  # noqa: F401
