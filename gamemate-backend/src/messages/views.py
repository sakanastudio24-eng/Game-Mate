"""Message API endpoints backed by service-layer domain logic."""

from rest_framework.exceptions import Throttled
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from messages.services.errors import DomainNotFoundError, DomainPermissionError, DomainValidationError
from messages.services.message_service import (
    get_conversation_messages,
    mark_conversation_read,
    send_message as send_conversation_message,
)
from messages.throttles import MessageSendThrottle
from messages.services.thread_service import (
    build_conversation_list,
    get_or_create_direct_conversation,
    get_participant_conversation,
)


def _error_response(exc):
    if isinstance(exc, DomainNotFoundError):
        return Response({"success": False, "message": str(exc)}, status=404)
    if isinstance(exc, DomainPermissionError):
        return Response({"success": False, "message": str(exc)}, status=403)
    if isinstance(exc, DomainValidationError):
        return Response({"success": False, "message": str(exc)}, status=400)
    return Response({"success": False, "message": "Request failed."}, status=400)


def _enforce_message_send_throttle(request):
    """Apply message-send throttling inside the shared send path."""

    throttle = MessageSendThrottle()
    if not throttle.allow_request(request, None):
        raise Throttled(wait=throttle.wait())


def _create_direct_conversation_response(request):
    """Create/reuse direct conversation using `user_id` from request body."""

    other_user_id = request.data.get("user_id")
    if other_user_id is None:
        return Response({"success": False, "message": "user_id is required."}, status=400)

    try:
        parsed_user_id = int(other_user_id)
    except (TypeError, ValueError):
        return Response({"success": False, "message": "Invalid user_id."}, status=400)

    try:
        conversation, created = get_or_create_direct_conversation(request.user, parsed_user_id)
    except (DomainNotFoundError, DomainPermissionError, DomainValidationError) as exc:
        return _error_response(exc)

    return Response(
        {
            "success": True,
            "data": {
                "conversation_id": conversation.id,
                "thread_id": conversation.id,  # legacy alias
                "created": created,
            },
        },
        status=201 if created else 200,
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    """GET inbox preview list, POST create/reuse a direct conversation."""

    if request.method == "POST":
        return _create_direct_conversation_response(request)

    data = build_conversation_list(request.user)
    return Response({"success": True, "count": len(data), "results": data}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_or_get_direct_conversation(request):
    """Compatibility endpoint for direct conversation creation."""

    return _create_direct_conversation_response(request)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def list_conversation_messages(request, conversation_id):
    """GET history or POST new message for one accessible conversation."""

    if request.method == "POST":
        return send_conversation_message_view(request, conversation_id)

    try:
        conversation = get_participant_conversation(conversation_id, request.user)
        payload = get_conversation_messages(conversation, request.user, mark_read=True)
    except (DomainNotFoundError, DomainPermissionError, DomainValidationError) as exc:
        return _error_response(exc)

    return Response({"success": True, "count": len(payload), "results": payload}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_conversation_message_view(request, conversation_id):
    """Send one message to a conversation if requester is a participant."""

    try:
        _enforce_message_send_throttle(request)
        conversation = get_participant_conversation(conversation_id, request.user)
        content = request.data.get("content")
        if content is None:
            content = request.data.get("body")
        message = send_conversation_message(conversation, request.user, content)
    except Throttled:
        raise
    except (DomainNotFoundError, DomainPermissionError, DomainValidationError) as exc:
        return _error_response(exc)

    return Response({"success": True, "data": {"message_id": message.id}}, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_conversation_read_view(request, conversation_id):
    """Mark the conversation read pointer for requester."""

    try:
        conversation = get_participant_conversation(conversation_id, request.user)
        last_read = mark_conversation_read(conversation, request.user)
    except (DomainNotFoundError, DomainPermissionError, DomainValidationError) as exc:
        return _error_response(exc)

    return Response(
        {
            "success": True,
            "data": {"last_read_message_id": getattr(last_read, "id", None)},
        },
        status=200,
    )


# Legacy routes kept for frontend compatibility while migrating to conversation endpoints.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_threads(request):
    """Legacy alias to list conversations."""

    return list_conversations(request)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_thread(request, user_id):
    """Legacy alias to create direct conversation by URL param."""

    try:
        conversation, created = get_or_create_direct_conversation(request.user, int(user_id))
    except (DomainNotFoundError, DomainPermissionError, DomainValidationError, ValueError):
        return Response({"success": False, "message": "Unable to resolve thread."}, status=400)

    return Response(
        {
            "success": True,
            "data": {
                "conversation_id": conversation.id,
                "thread_id": conversation.id,
                "created": created,
            },
        },
        status=201 if created else 200,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request, thread_id):
    """Legacy alias to send conversation message by old route naming."""

    return send_conversation_message_view(request, thread_id)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages(request, thread_id):
    """Legacy alias to list conversation messages by old route naming."""

    return list_conversation_messages(request, thread_id)
