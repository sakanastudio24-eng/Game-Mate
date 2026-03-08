from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Connection
from .serializers import ConnectionSerializer

User = get_user_model()


# Send a connection request from current user to target user.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_request(request, user_id):
    receiver = User.objects.filter(id=user_id).first()
    if not receiver:
        return Response({"detail": "User not found."}, status=404)

    if receiver.id == request.user.id:
        return Response({"detail": "Cannot connect to yourself."}, status=400)

    connection, created = Connection.objects.get_or_create(
        sender=request.user,
        receiver=receiver,
        defaults={"status": "pending"},
    )

    if not created:
        return Response({"detail": "Request already exists."}, status=200)

    return Response({"success": True}, status=201)


# Accept an incoming connection request.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_request(request, connection_id):
    connection = Connection.objects.filter(id=connection_id).first()
    if not connection:
        return Response({"detail": "Connection request not found."}, status=404)

    if connection.receiver != request.user:
        return Response({"detail": "Not allowed"}, status=403)

    if connection.status == "accepted":
        return Response({"success": True}, status=200)

    connection.status = "accepted"
    connection.save(update_fields=["status"])

    return Response({"success": True}, status=200)


# Return accepted friends list for the current user.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friends_list(request):
    connections = (
        Connection.objects.filter(status="accepted")
        .filter(Q(sender=request.user) | Q(receiver=request.user))
        .order_by("-created_at")
    )
    return Response({"count": connections.count(), "results": ConnectionSerializer(connections, many=True).data})
