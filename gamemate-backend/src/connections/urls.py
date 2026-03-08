from django.urls import path

from .views import accept_request, friends_list, send_request

urlpatterns = [
    path("", friends_list, name="friends_list"),
    path("request/<int:user_id>/", send_request, name="friend_request_send"),
    path("request/<int:connection_id>/accept/", accept_request, name="friend_request_accept"),
    path("add/<int:user_id>/", send_request, name="connection_add"),
    path("accept/<int:connection_id>/", accept_request, name="connection_accept"),
    path("friends/", friends_list, name="connection_friends"),
]
