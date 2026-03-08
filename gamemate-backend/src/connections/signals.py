from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from activity.services.activity_service import log_activity
from core.services.event_service import allow_event
from notifications.services import create_notification

from .models import Connection


# Cache status before save so post_save can detect transitions.
@receiver(pre_save, sender=Connection)
def capture_previous_status(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_status = None
        return

    instance._previous_status = (
        Connection.objects.filter(pk=instance.pk).values_list("status", flat=True).first()
    )


# Emit notifications for friend request and accept events.
@receiver(post_save, sender=Connection)
def connection_event_notification(sender, instance, created, **kwargs):
    if created and instance.status == "pending":
        if not allow_event(instance.sender_id, "friend_request"):
            return

        create_notification(
            user=instance.receiver,
            actor=instance.sender,
            type="friend_request",
        )
        log_activity(
            user=instance.sender,
            type="friend_request_sent",
            object_id=instance.id,
            metadata={"receiver_id": instance.receiver_id},
        )
        return

    previous_status = getattr(instance, "_previous_status", None)
    if previous_status != "accepted" and instance.status == "accepted":
        create_notification(
            user=instance.sender,
            actor=instance.receiver,
            type="friend_accept",
        )
        log_activity(
            user=instance.receiver,
            type="friend_added",
            object_id=instance.id,
            metadata={"friend_id": instance.sender_id},
        )
