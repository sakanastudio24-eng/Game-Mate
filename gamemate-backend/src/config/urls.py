"""Root URL configuration for API and admin routes."""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path

from accounts.views import (
    AuthLogoutView,
    AuthTokenRefreshView,
    LoginView,
    ProfileMeView,
    PublicProfilePostsView,
    PublicProfileView,
)


def trigger_error(_request):
    """Intentional crash route for Sentry verification in development."""

    # Intentional crash route for Sentry verification in development.
    return 1 / 0


def crash(_request):
    """Temporary crash endpoint used during Sentry setup/testing."""

    # Temporary test error endpoint for Sentry verification.
    raise Exception("Sentry test error")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/token/", LoginView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", AuthTokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", AuthLogoutView.as_view(), name="token_blacklist"),
    path("api/profile/me", ProfileMeView.as_view(), name="profile_me"),
    path("api/profile/me/", ProfileMeView.as_view(), name="profile_me_slash"),
    path("api/profile/<str:username>/posts", PublicProfilePostsView.as_view(), name="profile_posts"),
    path("api/profile/<str:username>/posts/", PublicProfilePostsView.as_view(), name="profile_posts_slash"),
    path("api/profile/<str:username>", PublicProfileView.as_view(), name="profile_public"),
    path("api/profile/<str:username>/", PublicProfileView.as_view(), name="profile_public_slash"),
    path("api/accounts/", include("accounts.urls")),
    path("api/connections/", include("connections.urls")),
    path("api/friends/", include("connections.urls")),
    path("api/", include("groups.urls")),
    path("api/", include("posts.urls")),
    path("api/", include("notifications.urls")),
    path("api/messages/", include("messages.urls")),
]

if settings.DEBUG:
    urlpatterns += [
        path("sentry-debug/", trigger_error, name="sentry_debug"),
        path("crash/", crash, name="sentry_crash"),
    ]
