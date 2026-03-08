from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from messages.services.errors import DomainNotFoundError, DomainPermissionError, DomainValidationError
from messages.services.message_service import get_thread_messages, send_message as send_thread_message
from messages.services.thread_service import (
    build_thread_list,
    get_or_create_thread,
    get_participant_thread,
)


# Create or return a direct thread between current user and target user.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_thread(request, user_id):
    try:
        thread, created = get_or_create_thread(request.user, user_id)
    except DomainNotFoundError as exc:
        return Response({"detail": str(exc)}, status=404)
    except DomainValidationError as exc:
        return Response({"detail": str(exc)}, status=400)

    return Response({"thread_id": thread.id}, status=201 if created else 200)


# Send a message into a thread if the sender is a participant.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request, thread_id):
    try:
        thread = get_participant_thread(thread_id, request.user)
        message = send_thread_message(thread, request.user, request.data.get("content"))
    except DomainNotFoundError as exc:
        return Response({"detail": str(exc)}, status=404)
    except DomainPermissionError as exc:
        return Response({"detail": str(exc)}, status=403)
    except DomainValidationError as exc:
        return Response({"detail": str(exc)}, status=400)

    return Response({"success": True, "message_id": message.id}, status=201)


# Fetch full message history for a thread if requester is a participant.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages(request, thread_id):
    try:
        thread = get_participant_thread(thread_id, request.user)
        payload = get_thread_messages(thread, request.user)
    except DomainNotFoundError as exc:
        return Response({"detail": str(exc)}, status=404)
    except DomainPermissionError as exc:
        return Response({"detail": str(exc)}, status=403)

    return Response(payload, status=200)


# Fetch DM thread list for the authenticated user with unread counts.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_threads(request):
    return Response(build_thread_list(request.user), status=200)
