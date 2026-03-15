from django.urls import path

from .views import get_notifications, mark_all_notifications_read, mark_notification_read

urlpatterns = [
    path("notifications/", get_notifications, name="notifications_list"),
    path(
        "notifications/<int:notification_id>/read/",
        mark_notification_read,
        name="notifications_mark_read",
    ),
    path("notifications/read-all/", mark_all_notifications_read, name="notifications_mark_all_read"),
]
