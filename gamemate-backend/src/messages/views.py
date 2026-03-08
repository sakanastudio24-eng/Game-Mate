from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.services import create_notification

from .models import Message, Thread

User = get_user_model()


# Create or return a direct thread between current user and target user.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_thread(request, user_id):
    other = User.objects.filter(id=user_id).first()
    if not other:
        return Response({"detail": "User not found."}, status=404)

    if other.id == request.user.id:
        return Response({"detail": "Cannot create a thread with yourself."}, status=400)

    thread = (
        Thread.objects.filter(participants=request.user)
        .filter(participants=other)
        .annotate(participant_count=Count("participants", distinct=True))
        .filter(participant_count=2)
        .first()
    )
    if thread:
        return Response({"thread_id": thread.id, "created": False}, status=200)

    thread = Thread.objects.create()
    thread.participants.add(request.user, other)
    return Response({"thread_id": thread.id, "created": True}, status=201)


# Send a message into a thread if the sender is a participant.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request, thread_id):
    thread = Thread.objects.filter(id=thread_id).first()
    if not thread:
        return Response({"detail": "Thread not found."}, status=404)

    if not thread.participants.filter(id=request.user.id).exists():
        return Response({"detail": "Not allowed."}, status=403)

    content = str(request.data.get("content", "")).strip()
    if not content:
        return Response({"detail": "Content is required."}, status=400)

    message = Message.objects.create(
        thread=thread,
        sender=request.user,
        content=content,
    )

    receivers = thread.participants.exclude(id=request.user.id)
    for receiver in receivers:
        create_notification(
            user=receiver,
            actor=request.user,
            type="message",
        )

    return Response({"success": True, "message_id": message.id}, status=201)


# Fetch full message history for a thread if requester is a participant.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages(request, thread_id):
    thread = Thread.objects.filter(id=thread_id).first()
    if not thread:
        return Response({"detail": "Thread not found."}, status=404)

    if not thread.participants.filter(id=request.user.id).exists():
        return Response({"detail": "Not allowed."}, status=403)

    messages = Message.objects.filter(thread_id=thread_id).select_related("sender").order_by("created_at")
    data = [
        {
            "sender": message.sender.username,
            "content": message.content,
            "created_at": message.created_at,
        }
        for message in messages
    ]
    return Response(data, status=200)
