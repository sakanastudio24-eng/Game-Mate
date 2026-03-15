"""Notification read endpoints for authenticated users."""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification


# Fetch most recent notifications for the authenticated user.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Return latest notification rows for the requester."""

    notifications = (
        Notification.objects.filter(user=request.user)
        .select_related("actor")
        .order_by("-created_at")[:20]
    )

    data = [
        {
            "id": notification.id,
            "actor": notification.actor.username,
            "type": notification.type,
            "post_id": notification.post_id,
            "conversation_id": notification.conversation_id,
            "message_id": notification.message_id,
            "is_read": notification.is_read,
            "created_at": notification.created_at,
        }
        for notification in notifications
    ]

    return Response({"success": True, "count": len(data), "results": data})


# Mark one notification as read for the authenticated user.
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark one owned notification as read."""

    notification = Notification.objects.filter(id=notification_id, user=request.user).first()
    if not notification:
        return Response(
            {"success": False, "message": "Notification not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not notification.is_read:
        notification.is_read = True
        notification.save(update_fields=["is_read"])

    return Response(
        {"success": True, "data": {"id": notification.id, "is_read": notification.is_read}},
        status=status.HTTP_200_OK,
    )


# Mark all notifications as read for the authenticated user.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark every unread notification owned by the requester as read."""

    updated_count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response(
        {"success": True, "data": {"updated": updated_count}},
        status=status.HTTP_200_OK,
    )
