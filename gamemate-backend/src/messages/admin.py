from django.contrib import admin

from .models import Message, Thread


@admin.register(Thread)
class ThreadAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at")
    ordering = ("-created_at",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "thread", "sender", "is_read", "created_at")
    search_fields = ("sender__username", "content")
    ordering = ("-created_at",)
