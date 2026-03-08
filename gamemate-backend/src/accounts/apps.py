from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self):
        """Load signal registrations when Django starts the accounts app."""
        import accounts.signals  # noqa: F401
