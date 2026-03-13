from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import (
    TokenBlacklistSerializer,
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from connections.models import Connection
from groups.models import GroupMembership
from posts.models import Post
from posts.serializers import PostSerializer
from config.pagination import StandardPageNumberPagination
from .models import Profile, User
from .serializers import MeSerializer, ProfileSerializer, PublicProfileSerializer
from .throttles import LoginThrottle


def _is_friend(user, target_user) -> bool:
    """Return True when two users have an accepted bidirectional connection."""
    return Connection.objects.filter(status="accepted").filter(
        Q(sender=user, receiver=target_user) | Q(sender=target_user, receiver=user)
    ).exists()


def _can_view_profile(request_user, target_user, target_profile: Profile) -> bool:
    """Profile visibility rule for detail and profile-post endpoints."""
    if request_user.id == target_user.id:
        return True
    if target_profile.visibility == Profile.VISIBILITY_PUBLIC:
        return True
    return _is_friend(request_user, target_user)


def _build_profile_payload(target_user, target_profile: Profile):
    """Build public profile payload including computed stats counters."""
    posts_count = Post.objects.filter(creator=target_user, is_deleted=False).count()
    friends_count = Connection.objects.filter(status="accepted").filter(
        Q(sender=target_user) | Q(receiver=target_user)
    ).count()
    groups_count = GroupMembership.objects.filter(user=target_user).values("group_id").distinct().count()

    return {
        "username": target_user.username,
        "bio": target_profile.bio,
        "avatar_url": target_profile.avatar_url,
        "favorite_games": target_profile.favorite_games or [],
        "visibility": target_profile.visibility,
        "stats": {
            "posts": posts_count,
            "friends": friends_count,
            "groups": groups_count,
        },
    }


# JWT login endpoint with normalized response shape.
class LoginView(TokenObtainPairView):
    """Issue JWT access/refresh tokens for valid email/password credentials."""

    serializer_class = TokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]

    def post(self, request, *args, **kwargs):
        """Validate credentials and return the token pair in a stable response envelope."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"success": True, "data": serializer.validated_data})


# JWT refresh endpoint with normalized response shape.
class AuthTokenRefreshView(TokenRefreshView):
    """Refresh an access token using a valid refresh token."""

    serializer_class = TokenRefreshSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """Validate incoming refresh token and return a new access token."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"success": True, "data": serializer.validated_data})


# JWT logout endpoint that blacklists refresh tokens.
class AuthLogoutView(APIView):
    """Blacklist refresh token to invalidate future refresh attempts."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Blacklist the provided refresh token and confirm logout."""
        serializer = TokenBlacklistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "message": "Logged out."}, status=status.HTTP_200_OK)


# Authenticated profile endpoint for the current account.
class MeView(APIView):
    """Return the authenticated account profile payload."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Serve current user identity and profile data."""
        return Response({"success": True, "data": MeSerializer(request.user).data})


# Authenticated profile endpoint (`/api/profile/me`) with read/update support.
class ProfileMeView(APIView):
    """Read or update the authenticated user's profile preferences."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return current profile data used by personalization and feed logic."""
        profile, _ = Profile.objects.get_or_create(user=request.user)
        return Response({"success": True, "data": ProfileSerializer(profile).data})

    def patch(self, request):
        """Apply partial profile updates for bio/avatar/favorite_games."""
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class PublicProfileView(APIView):
    """Return profile details for a username, including summary stats."""

    permission_classes = [IsAuthenticated]

    def get(self, request, username: str):
        target_user = User.objects.filter(username__iexact=username).first()
        if not target_user:
            return Response({"success": False, "message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        target_profile, _ = Profile.objects.get_or_create(user=target_user)
        if not _can_view_profile(request.user, target_user, target_profile):
            return Response({"success": False, "message": "Profile is private."}, status=status.HTTP_403_FORBIDDEN)

        payload = _build_profile_payload(target_user, target_profile)
        return Response({"success": True, "data": PublicProfileSerializer(payload).data})


class PublicProfilePostsView(APIView):
    """Return timeline posts for a given username, respecting profile visibility."""

    permission_classes = [IsAuthenticated]
    pagination_class = StandardPageNumberPagination

    def get(self, request, username: str):
        target_user = User.objects.filter(username__iexact=username).first()
        if not target_user:
            return Response({"success": False, "message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        target_profile, _ = Profile.objects.get_or_create(user=target_user)
        if not _can_view_profile(request.user, target_user, target_profile):
            return Response({"success": False, "message": "Profile is private."}, status=status.HTTP_403_FORBIDDEN)

        queryset = Post.objects.filter(creator=target_user, is_deleted=False).order_by("-created_at")
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = PostSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
