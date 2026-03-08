from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User


@receiver(post_save, sender=User)
# Reserved post-save hook for future account bootstrap tasks.
def handle_user_post_save(sender, instance: User, created: bool, **kwargs):
    """Reserved hook for future user bootstrap side effects."""
    return None
