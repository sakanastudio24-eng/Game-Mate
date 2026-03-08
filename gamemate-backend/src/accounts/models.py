from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class User(AbstractUser):
    """Custom auth model that uses email as the login identifier."""

    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        """Return readable identifier in admin/debug output."""
        return self.email


class Profile(models.Model):
    """Public-facing profile data kept separate from auth identity fields."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    display_name = models.CharField(max_length=150)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Return display name for admin/debug output."""
        return self.display_name


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    """Ensure every user has a profile row immediately after account creation."""
    if created:
        Profile.objects.create(
            user=instance,
            display_name=instance.username
        )
