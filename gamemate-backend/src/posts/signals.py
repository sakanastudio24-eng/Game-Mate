from django.db.models.signals import post_save
from django.dispatch import receiver

from activity.services.activity_service import log_activity
from notifications.services import create_notification

from .models import Post, PostInteraction, PostShare


# Emit activity log row when a new post is created.
@receiver(post_save, sender=Post)
def post_created(sender, instance, created, **kwargs):
    if not created:
        return

    log_activity(
        user=instance.creator,
        type="post_created",
        object_id=instance.id,
        metadata={"game": instance.game},
    )


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

    interaction_activity_type = {
        "like": "post_liked",
        "comment": "post_commented",
        "share": "post_shared",
    }[instance.interaction_type]
    log_activity(
        user=instance.user,
        type=interaction_activity_type,
        object_id=instance.post_id,
        metadata={"post_creator_id": instance.post.creator_id},
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

    log_activity(
        user=instance.sender,
        type="post_shared_direct",
        object_id=instance.post_id,
        metadata={"receiver_id": instance.receiver_id},
    )
