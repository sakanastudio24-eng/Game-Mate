"""Celery tasks for activity event writes."""

from celery import shared_task

from activity.services.activity_service import create_activity_record


# Async task for writing activity records.
@shared_task(name="activity.log_activity")
def log_activity_task(user_id, type, object_id=None, metadata=None):
    """Asynchronous wrapper around activity record creation."""

    create_activity_record(
        user_id=user_id,
        type=type,
        object_id=object_id,
        metadata=metadata or {},
    )
