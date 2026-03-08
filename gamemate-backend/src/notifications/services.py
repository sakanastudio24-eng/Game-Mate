from .models import Notification


# Persist a notification row synchronously.
def create_notification_record(user_id, actor_id, type, post_id=None):
    if user_id == actor_id:
        return

    Notification.objects.create(
        user_id=user_id,
        actor_id=actor_id,
        type=type,
        post_id=post_id,
    )


# Queue notification processing; fallback to sync create if queue is unavailable.
def queue_notification(user_id, actor_id, type, post_id=None):
    from .tasks import create_notification_task

    try:
        create_notification_task.delay(
            user_id=user_id,
            actor_id=actor_id,
            type=type,
            post_id=post_id,
        )
    except Exception:
        create_notification_record(
            user_id=user_id,
            actor_id=actor_id,
            type=type,
            post_id=post_id,
        )


# Central notification helper used by signals and feature actions.
def create_notification(user, actor, type, post_id=None):
    user_id = getattr(user, "id", user)
    actor_id = getattr(actor, "id", actor)

    if user_id == actor_id:
        return

    queue_notification(
        user_id=user_id,
        actor_id=actor_id,
        type=type,
        post_id=post_id,
    )
