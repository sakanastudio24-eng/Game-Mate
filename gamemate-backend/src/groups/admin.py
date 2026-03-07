from django.contrib import admin
from .models import Group, GroupMembership


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "is_private", "created_at")
    search_fields = ("name", "owner__email")
    list_filter = ("is_private",)
    ordering = ("-created_at",)


@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    list_display = ("id", "group", "user", "role", "joined_at")
    search_fields = ("group__name", "user__email")
    list_filter = ("role",)
    ordering = ("-joined_at",)
