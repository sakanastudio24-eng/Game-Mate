from django.apps import AppConfig


# AppConfig for accounts domain and signal registration.
class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    # Load signal module during Django app startup.
    def ready(self):
        """Load signal registrations when Django starts the accounts app."""
        import accounts.signals  # noqa: F401
