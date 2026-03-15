from django.urls import path

from .views import (
    accept_request,
    cancel_request,
    friends_list,
    pending_requests,
    reject_request,
    search_users,
    send_request,
)

urlpatterns = [
    path("", friends_list, name="friends_list"),
    path("search/", search_users, name="friend_search"),
    path("requests/", pending_requests, name="friend_requests_pending"),
    path("request/<int:user_id>/", send_request, name="friend_request_send"),
    path("request/<int:connection_id>/accept/", accept_request, name="friend_request_accept"),
    path("request/<int:connection_id>/reject/", reject_request, name="friend_request_reject"),
    path("request/<int:connection_id>/cancel/", cancel_request, name="friend_request_cancel"),
    path("add/<int:user_id>/", send_request, name="connection_add"),
    path("accept/<int:connection_id>/", accept_request, name="connection_accept"),
    path("reject/<int:connection_id>/", reject_request, name="connection_reject"),
    path("cancel/<int:connection_id>/", cancel_request, name="connection_cancel"),
    path("friends/", friends_list, name="connection_friends"),
]
