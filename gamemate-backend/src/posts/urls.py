from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import FeedView, PostInteractionViewSet, PostViewSet, explain_feed_post, share_post

router = DefaultRouter()
router.register(r"posts", PostViewSet, basename="post")
router.register(r"interactions", PostInteractionViewSet, basename="interaction")

urlpatterns = [
    path("feed/", FeedView.as_view(), name="feed"),
    path("feed/explain/<int:post_id>/", explain_feed_post, name="feed_explain_post"),
    path("share/<int:post_id>/<int:user_id>/", share_post, name="post_share"),
] + router.urls
