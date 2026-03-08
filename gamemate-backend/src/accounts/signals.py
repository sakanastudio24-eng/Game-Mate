from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Profile, User


@receiver(post_save, sender=User)
# Signal handler to guarantee profile row exists for new users.
def create_profile(sender, instance: User, created: bool, **kwargs):
    """Create a profile row immediately after a user account is created."""
    if created:
        Profile.objects.get_or_create(user=instance)
