from django.urls import path

from .views import (
    create_or_get_direct_conversation,
    create_thread,
    get_messages,
    list_conversation_messages,
    list_conversations,
    list_threads,
    mark_conversation_read_view,
    send_conversation_message_view,
    send_message,
)

urlpatterns = [
    # New conversation-based routes
    path("conversations/", list_conversations, name="messages_conversations"),
    path(
        "conversations/direct/",
        create_or_get_direct_conversation,
        name="messages_conversation_direct",
    ),
    path(
        "conversations/<int:conversation_id>/messages/",
        list_conversation_messages,
        name="messages_conversation_messages",
    ),
    path(
        "conversations/<int:conversation_id>/messages/send/",
        send_conversation_message_view,
        name="messages_conversation_send",
    ),
    path(
        "conversations/<int:conversation_id>/read/",
        mark_conversation_read_view,
        name="messages_conversation_read",
    ),
    # Legacy routes retained for current frontend compatibility
    path("threads/", list_threads, name="messages_threads"),
    path("thread/<int:user_id>/", create_thread, name="messages_create_thread"),
    path("send/<int:thread_id>/", send_message, name="messages_send"),
    path("messages/<int:thread_id>/", get_messages, name="messages_list"),
]
