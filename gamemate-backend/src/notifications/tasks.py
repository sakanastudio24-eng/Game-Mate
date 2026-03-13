"""Celery task entrypoints for notification writes."""

from celery import shared_task

from .services import create_notification_record


# Async task for creating notification records.
@shared_task(name="notifications.create_notification")
def create_notification_task(user_id, actor_id, type, post_id=None):
    """Asynchronous task wrapper for notification creation."""

    create_notification_record(
        user_id=user_id,
        actor_id=actor_id,
        type=type,
        post_id=post_id,
    )
