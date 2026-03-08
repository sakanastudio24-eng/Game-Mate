from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Post, PostInteraction
from .serializers import PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for feed posts."""

    queryset = Post.objects.select_related("creator").all().order_by("-created_at")
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Attach authenticated user as post creator on create."""
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        """Store a like interaction for the current user and post."""
        post = self.get_object()
        PostInteraction.objects.get_or_create(
            user=request.user,
            post=post,
            interaction_type="like",
        )
        return Response({"success": True}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def share(self, request, pk=None):
        """Store a share interaction for the current user and post."""
        post = self.get_object()
        PostInteraction.objects.get_or_create(
            user=request.user,
            post=post,
            interaction_type="share",
        )
        return Response({"success": True}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def skip(self, request, pk=None):
        """Store a skip interaction for the current user and post."""
        post = self.get_object()
        PostInteraction.objects.get_or_create(
            user=request.user,
            post=post,
            interaction_type="skip",
        )
        return Response({"success": True}, status=status.HTTP_200_OK)
