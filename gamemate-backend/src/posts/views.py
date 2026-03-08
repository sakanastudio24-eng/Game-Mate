from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Post, PostInteraction
from .serializers import PostSerializer
from .serializers_interaction import PostInteractionSerializer
from posts.services.feed_service import FeedService


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


class PostInteractionViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for recording post interaction signals."""

    queryset = PostInteraction.objects.select_related("post", "user").all().order_by("-created_at")
    serializer_class = PostInteractionSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        """Limit interaction visibility to the authenticated user's own events."""
        return self.queryset.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create or reuse an interaction for this user/post/type combination."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        interaction, created = PostInteraction.objects.get_or_create(
            user=request.user,
            post=serializer.validated_data["post"],
            interaction_type=serializer.validated_data["interaction_type"],
        )

        data = self.get_serializer(interaction).data
        return Response(
            {"success": True, "created": created, "data": data},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class FeedView(APIView):
    """Feed endpoint that returns engagement-ranked posts."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return scored feed results for the authenticated user."""
        feed_items = FeedService.get_feed(request.user)
        posts = [item["post"] for item in feed_items]
        serializer = PostSerializer(posts, many=True)
        results = []

        for post_data, item in zip(serializer.data, feed_items):
            meta = dict(item["meta"])
            # Keep score internal for ranking logic; do not expose in API yet.
            meta.pop("score", None)
            post_data["feed_meta"] = meta
            results.append(post_data)

        return Response(
            {
                "success": True,
                "count": len(results),
                "results": results,
            }
        )
