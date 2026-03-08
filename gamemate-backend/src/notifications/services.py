from .models import Notification


# Central notification creator used by feature actions.
def create_notification(user, actor, type, post_id=None):
    if user.id == actor.id:
        return

    Notification.objects.create(
        user=user,
        actor=actor,
        type=type,
        post_id=post_id,
    )
