from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Post
from .serializers import PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for feed posts."""

    queryset = Post.objects.select_related("creator").all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Attach authenticated user as post creator on create."""
        serializer.save(creator=self.request.user)
