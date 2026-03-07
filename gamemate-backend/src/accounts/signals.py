from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User


@receiver(post_save, sender=User)
def handle_user_post_save(sender, instance: User, created: bool, **kwargs):
    # Placeholder hook for future profile/bootstrap logic.
    return None
