from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

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
        create_notification(
            user=instance.receiver,
            actor=instance.sender,
            type="friend_request",
        )
        return

    previous_status = getattr(instance, "_previous_status", None)
    if previous_status != "accepted" and instance.status == "accepted":
        create_notification(
            user=instance.sender,
            actor=instance.receiver,
            type="friend_accept",
        )
