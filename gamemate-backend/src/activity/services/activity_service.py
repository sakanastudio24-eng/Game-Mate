"""Activity service helpers used by signals and async tasks."""

from activity.models import Activity


# Persist activity row synchronously.
def create_activity_record(user_id, type, object_id=None, metadata=None):
    """Write one activity event row directly to the database."""

    Activity.objects.create(
        user_id=user_id,
        type=type,
        object_id=object_id,
        metadata=metadata or {},
    )


# Queue activity write and fallback to sync if queue is unavailable.
def queue_activity(user_id, type, object_id=None, metadata=None):
    """Send activity write to Celery with graceful sync fallback."""

    from activity.tasks import log_activity_task

    try:
        log_activity_task.delay(
            user_id=user_id,
            type=type,
            object_id=object_id,
            metadata=metadata or {},
        )
    except Exception:
        create_activity_record(
            user_id=user_id,
            type=type,
            object_id=object_id,
            metadata=metadata,
        )


# Public activity logger used by signals and services.
def log_activity(user, type, object_id=None, metadata=None):
    """Log activity for a model instance or raw user id."""

    user_id = getattr(user, "id", user)
    queue_activity(
        user_id=user_id,
        type=type,
        object_id=object_id,
        metadata=metadata,
    )
