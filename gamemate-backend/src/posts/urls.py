from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import FeedView, PostInteractionViewSet, PostViewSet

router = DefaultRouter()
router.register(r"posts", PostViewSet, basename="post")
router.register(r"interactions", PostInteractionViewSet, basename="interaction")

urlpatterns = [
    path("feed/", FeedView.as_view(), name="feed"),
] + router.urls
