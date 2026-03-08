from activity.models import Activity


# Persist activity row synchronously.
def create_activity_record(user_id, type, object_id=None, metadata=None):
    Activity.objects.create(
        user_id=user_id,
        type=type,
        object_id=object_id,
        metadata=metadata or {},
    )


# Queue activity write and fallback to sync if queue is unavailable.
def queue_activity(user_id, type, object_id=None, metadata=None):
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
    user_id = getattr(user, "id", user)
    queue_activity(
        user_id=user_id,
        type=type,
        object_id=object_id,
        metadata=metadata,
    )
