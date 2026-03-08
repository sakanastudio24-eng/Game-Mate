from django.db.models.signals import post_save
from django.dispatch import receiver

from notifications.services import create_notification

from .models import PostInteraction, PostShare


# Emit notifications for social interactions on posts.
@receiver(post_save, sender=PostInteraction)
def post_interaction_created(sender, instance, created, **kwargs):
    if not created:
        return

    if instance.interaction_type not in {"like", "comment", "share"}:
        return

    create_notification(
        user=instance.post.creator,
        actor=instance.user,
        type=instance.interaction_type,
        post_id=instance.post_id,
    )


# Emit notification for direct post share records.
@receiver(post_save, sender=PostShare)
def post_shared_direct(sender, instance, created, **kwargs):
    if not created:
        return

    create_notification(
        user=instance.receiver,
        actor=instance.sender,
        type="share",
        post_id=instance.post_id,
    )
