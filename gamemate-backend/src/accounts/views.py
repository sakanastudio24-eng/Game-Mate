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

from .serializers import MeSerializer
from .throttles import LoginThrottle


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


class AuthTokenRefreshView(TokenRefreshView):
    """Refresh an access token using a valid refresh token."""

    serializer_class = TokenRefreshSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """Validate incoming refresh token and return a new access token."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"success": True, "data": serializer.validated_data})


class AuthLogoutView(APIView):
    """Blacklist refresh token to invalidate future refresh attempts."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Blacklist the provided refresh token and confirm logout."""
        serializer = TokenBlacklistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "message": "Logged out."}, status=status.HTTP_200_OK)


class MeView(APIView):
    """Return the authenticated account profile payload."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Serve current user identity and profile data."""
        return Response({"success": True, "data": MeSerializer(request.user).data})
