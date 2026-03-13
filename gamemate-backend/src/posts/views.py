from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .feed import score_post
from .models import Post, PostInteraction, PostShare
from .serializers import PostSerializer
from .serializers_interaction import PostInteractionSerializer
from posts.services.cache_service import (
    invalidate_like_count_cache,
    invalidate_trending_post_ids_cache,
)
from posts.services.feed_service import FeedService

User = get_user_model()


# Post CRUD and post-action endpoints.
class PostViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for feed posts."""

    queryset = (
        Post.objects.select_related("creator")
        .filter(is_deleted=False)
        .order_by("-created_at")
    )
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Attach authenticated user as post creator on create."""
        serializer.save(creator=self.request.user)

    def get_queryset(self):
        """Hide deleted posts by default; include them for restore action lookup."""
        base_qs = Post.objects.select_related("creator").order_by("-created_at")
        if self.action == "restore":
            return base_qs
        return base_qs.filter(is_deleted=False)

    def destroy(self, request, *args, **kwargs):
        """Soft-delete post instead of physically removing database row."""
        post = self.get_object()
        post.is_deleted = True
        post.deleted_at = timezone.now()
        post.save(update_fields=["is_deleted", "deleted_at"])
        invalidate_like_count_cache(post.id)
        invalidate_trending_post_ids_cache()
        return Response({"success": True}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path=r"restore/(?P<post_id>[^/.]+)")
    def restore(self, request, post_id=None):
        """Restore a soft-deleted post by clearing deletion markers."""
        post = Post.objects.filter(id=post_id).first()
        if not post:
            return Response(
                {"success": False, "message": "Post not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        post.is_deleted = False
        post.deleted_at = None
        post.save(update_fields=["is_deleted", "deleted_at"])
        invalidate_like_count_cache(post.id)
        invalidate_trending_post_ids_cache()
        return Response({"success": True}, status=status.HTTP_200_OK)

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


# Interaction create/list endpoints for authenticated user.
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
        if serializer.validated_data["post"].is_deleted:
            return Response(
                {"success": False, "message": "Post not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        interaction_type = serializer.validated_data["interaction_type"]
        post = serializer.validated_data["post"]
        interaction, created = PostInteraction.objects.get_or_create(
            user=request.user,
            post=post,
            interaction_type=interaction_type,
        )

        data = self.get_serializer(interaction).data
        return Response(
            {"success": True, "created": created, "data": data},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


# Feed endpoint that returns ranked post results with metadata.
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


# Share a post directly from sender to receiver user.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def share_post(request, post_id, user_id):
    post = Post.objects.filter(id=post_id, is_deleted=False).first()
    if not post:
        return Response({"success": False, "message": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    receiver = User.objects.filter(id=user_id).first()
    if not receiver:
        return Response({"success": False, "message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    PostShare.objects.create(
        sender=request.user,
        receiver=receiver,
        post=post,
    )

    return Response({"success": True}, status=status.HTTP_201_CREATED)


# Explain why a specific post appears in this user's feed.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def explain_feed_post(request, post_id):
    post = Post.objects.filter(id=post_id, is_deleted=False).first()
    if not post:
        return Response({"success": False, "message": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    score, reasons, signals = score_post(post, request.user)
    return Response(
        {"success": True, "data": {"post_id": post.id, "score": score, "reasons": reasons, "signals": signals}}
    )
