from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import FeedView, PostViewSet

router = DefaultRouter()
router.register(r"posts", PostViewSet, basename="post")

urlpatterns = [
    path("feed/", FeedView.as_view(), name="feed"),
] + router.urls
