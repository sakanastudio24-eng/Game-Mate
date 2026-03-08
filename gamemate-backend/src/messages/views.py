from django.contrib.auth import get_user_model
from django.db.models import Q
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

    threads = Thread.objects.filter(participants=request.user)
    for thread in threads:
        if thread.participants.filter(id=other.id).exists() and thread.participants.count() == 2:
            return Response({"thread_id": thread.id}, status=200)

    thread = Thread.objects.create()
    thread.participants.add(request.user, other)
    return Response({"thread_id": thread.id}, status=201)


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

    Message.objects.filter(
        thread_id=thread_id,
        is_read=False,
    ).exclude(sender=request.user).update(is_read=True)

    messages = Message.objects.filter(thread_id=thread_id).select_related("sender").order_by("created_at")
    data = [
        {
            "sender": message.sender.username,
            "content": message.content,
            "is_read": message.is_read,
            "created_at": message.created_at,
        }
        for message in messages
    ]
    return Response(data, status=200)


# Fetch DM thread list for the authenticated user with unread counts.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_threads(request):
    threads = (
        Thread.objects.filter(participants=request.user)
        .prefetch_related("participants", "messages")
        .order_by("-created_at")
    )

    results = []
    for thread in threads:
        participants = [
            user.username
            for user in thread.participants.all()
            if user.id != request.user.id
        ]
        last_message = thread.messages.order_by("-created_at").first()
        unread_count = thread.messages.filter(~Q(sender=request.user), is_read=False).count()
        results.append(
            {
                "thread_id": thread.id,
                "participants": participants,
                "last_message": last_message.content if last_message else "",
                "unread": unread_count,
            }
        )

    return Response(results, status=200)
