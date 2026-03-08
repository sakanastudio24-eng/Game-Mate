from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification


# Fetch most recent notifications for the authenticated user.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = (
        Notification.objects.filter(user=request.user)
        .select_related("actor")
        .order_by("-created_at")[:20]
    )

    data = [
        {
            "actor": notification.actor.username,
            "type": notification.type,
            "post_id": notification.post_id,
            "is_read": notification.is_read,
            "created_at": notification.created_at,
        }
        for notification in notifications
    ]

    return Response(data)
