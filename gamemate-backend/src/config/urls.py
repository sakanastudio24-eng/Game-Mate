from django.contrib import admin
from django.urls import include, path

from accounts.views import AuthLogoutView, AuthTokenObtainPairView, AuthTokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/token/", AuthTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", AuthTokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", AuthLogoutView.as_view(), name="token_blacklist"),
    path("api/accounts/", include("accounts.urls")),
    path("api/", include("groups.urls")),
]
