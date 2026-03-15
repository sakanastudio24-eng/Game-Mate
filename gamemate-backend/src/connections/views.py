"""Connection endpoints for requests, acceptance, and friend list retrieval."""

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.db.models.functions import Lower
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Connection
from .serializers import ConnectionSerializer
from .throttles import FriendRequestThrottle

User = get_user_model()


def _serialize_relationship_state(request_user, target_user):
    """Return relationship state metadata between requester and one searched user."""

    connection = (
        Connection.objects.filter(
            Q(sender=request_user, receiver=target_user)
            | Q(sender=target_user, receiver=request_user)
        )
        .order_by("-created_at")
        .first()
    )
    if not connection:
        return {"relationship_status": "none", "connection_id": None}

    if connection.status == "accepted":
        return {"relationship_status": "accepted", "connection_id": connection.id}

    direction = "outgoing_pending" if connection.sender_id == request_user.id else "incoming_pending"
    return {"relationship_status": direction, "connection_id": connection.id}


# Send a connection request from current user to target user.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([FriendRequestThrottle])
def send_request(request, user_id):
    """Create a pending friend request from the requester to the target user."""

    receiver = User.objects.filter(id=user_id).first()
    if not receiver:
        return Response({"success": False, "message": "User not found."}, status=404)

    if receiver.id == request.user.id:
        return Response({"success": False, "message": "Cannot connect to yourself."}, status=400)

    existing_relationship = (
        Connection.objects.filter(
            Q(sender=request.user, receiver=receiver)
            | Q(sender=receiver, receiver=request.user)
        )
        .order_by("-created_at")
        .first()
    )
    if existing_relationship:
        if existing_relationship.status == "accepted":
            return Response({"success": True, "message": "Already connected."}, status=200)
        if existing_relationship.sender_id == request.user.id:
            return Response({"success": True, "message": "Request already exists."}, status=200)
        return Response({"success": True, "message": "Incoming request already exists."}, status=200)

    connection, created = Connection.objects.get_or_create(
        sender=request.user,
        receiver=receiver,
        defaults={"status": "pending"},
    )

    if not created:
        return Response({"success": True, "message": "Request already exists."}, status=200)

    return Response({"success": True, "message": "Friend request sent."}, status=201)


# Accept an incoming connection request.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_request(request, connection_id):
    """Accept a pending request when requester is the intended receiver."""

    connection = Connection.objects.filter(id=connection_id).first()
    if not connection:
        return Response({"success": False, "message": "Connection request not found."}, status=404)

    if connection.receiver != request.user:
        return Response({"success": False, "message": "Not allowed."}, status=403)

    if connection.status == "accepted":
        return Response({"success": True, "message": "Already accepted."}, status=200)

    connection.status = "accepted"
    connection.save(update_fields=["status"])

    return Response({"success": True, "message": "Friend request accepted."}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_request(request, connection_id):
    """Reject an incoming pending request when requester is the receiver."""

    connection = Connection.objects.filter(id=connection_id).first()
    if not connection:
        return Response({"success": False, "message": "Connection request not found."}, status=404)

    if connection.receiver_id != request.user.id:
        return Response({"success": False, "message": "Not allowed."}, status=403)

    if connection.status != "pending":
        return Response({"success": False, "message": "Only pending requests can be rejected."}, status=400)

    connection.delete()
    return Response({"success": True, "message": "Friend request rejected."}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_request(request, connection_id):
    """Cancel an outgoing pending request when requester is the sender."""

    connection = Connection.objects.filter(id=connection_id).first()
    if not connection:
        return Response({"success": False, "message": "Connection request not found."}, status=404)

    if connection.sender_id != request.user.id:
        return Response({"success": False, "message": "Not allowed."}, status=403)

    if connection.status != "pending":
        return Response({"success": False, "message": "Only pending requests can be cancelled."}, status=400)

    connection.delete()
    return Response({"success": True, "message": "Friend request cancelled."}, status=200)


# Return accepted friends list for the current user.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friends_list(request):
    """Return accepted bidirectional connections for the requester."""

    connections = (
        Connection.objects.filter(status="accepted")
        .filter(Q(sender=request.user) | Q(receiver=request.user))
        .order_by("-created_at")
    )
    return Response(
        {
            "success": True,
            "count": connections.count(),
            "results": ConnectionSerializer(connections, many=True).data,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_requests(request):
    """Return pending connection requests for requester with incoming/outgoing direction."""

    pending = (
        Connection.objects.filter(status="pending")
        .filter(Q(sender=request.user) | Q(receiver=request.user))
        .order_by("-created_at")
    )
    results = []
    for connection in pending:
        direction = "incoming" if connection.receiver_id == request.user.id else "outgoing"
        results.append(
            {
                "id": connection.id,
                "sender": connection.sender.username,
                "receiver": connection.receiver.username,
                "status": connection.status,
                "created_at": connection.created_at,
                "direction": direction,
            }
        )

    return Response({"success": True, "count": len(results), "results": results})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_users(request):
    """Search users by username or email and include relationship state to requester."""

    query = str(request.query_params.get("q", "")).strip()
    if not query:
        return Response({"success": False, "message": "Search query is required."}, status=400)

    users = (
        User.objects.annotate(username_lower=Lower("username"), email_lower=Lower("email"))
        .filter(Q(username__icontains=query) | Q(email__icontains=query))
        .exclude(id=request.user.id)
        .order_by("username_lower")[:20]
    )

    results = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            **_serialize_relationship_state(request.user, user),
        }
        for user in users
    ]

    return Response({"success": True, "count": len(results), "results": results}, status=200)
