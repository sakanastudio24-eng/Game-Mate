from django.urls import path

from .views import create_thread, get_messages, list_threads, send_message

urlpatterns = [
    path("threads/", list_threads, name="messages_threads"),
    path("thread/<int:user_id>/", create_thread, name="messages_create_thread"),
    path("send/<int:thread_id>/", send_message, name="messages_send"),
    path("messages/<int:thread_id>/", get_messages, name="messages_list"),
]
