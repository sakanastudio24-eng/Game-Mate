from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Group, GroupMembership


@receiver(post_save, sender=Group)
def add_owner_membership(sender, instance: Group, created: bool, **kwargs):
    """Create owner membership row whenever a new group is created."""
    if not created:
        return

    GroupMembership.objects.create(
        user=instance.owner,
        group=instance,
        role=GroupMembership.ROLE_OWNER,
    )
