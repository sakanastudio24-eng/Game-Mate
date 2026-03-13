"""Message-domain signals for notifications and activity logging."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from activity.services.activity_service import log_activity
from core.services.event_service import allow_event
from notifications.services import create_notification

from .models import Message


# Emit message notification when a new message is created.
@receiver(post_save, sender=Message)
def message_created(sender, instance, created, **kwargs):
    """Emit notifications/activity whenever a new message is created."""

    if not created:
        return

    if not allow_event(instance.sender_id, "message"):
        return

    receivers = instance.thread.participants.exclude(id=instance.sender_id)
    for receiver in receivers:
        create_notification(
            user=receiver,
            actor=instance.sender,
            type="message",
        )

    log_activity(
        user=instance.sender,
        type="message_sent",
        object_id=instance.id,
        metadata={"thread_id": instance.thread_id},
    )
