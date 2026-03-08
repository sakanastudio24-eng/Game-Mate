from django.contrib import admin
from django.urls import include, path

from accounts.views import AuthLogoutView, AuthTokenRefreshView, LoginView, ProfileMeView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/token/", LoginView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", AuthTokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", AuthLogoutView.as_view(), name="token_blacklist"),
    path("api/profile/me", ProfileMeView.as_view(), name="profile_me"),
    path("api/profile/me/", ProfileMeView.as_view(), name="profile_me_slash"),
    path("api/accounts/", include("accounts.urls")),
    path("api/connections/", include("connections.urls")),
    path("api/", include("groups.urls")),
    path("api/", include("posts.urls")),
]
