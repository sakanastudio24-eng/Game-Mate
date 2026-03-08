from django.contrib.auth.models import AbstractUser
from django.db import models


# Custom auth user model that logs in with email.
class User(AbstractUser):
    """Custom auth model that uses email as the login identifier."""

    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        """Return readable identifier in admin/debug output."""
        return self.email


# Public profile extension linked 1:1 with user.
class Profile(models.Model):
    """Public-facing profile data kept separate from auth identity fields."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    favorite_games = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Return username for admin/debug output."""
        return self.user.username
