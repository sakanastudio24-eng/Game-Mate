"""Admin registrations for group and membership management."""

from django.contrib import admin
from .models import Group, GroupMembership


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    """Admin config for groups including visibility and owner search."""

    list_display = ("id", "name", "owner", "is_private", "created_at")
    search_fields = ("name", "owner__username")
    list_filter = ("is_private", "created_at")


@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    """Admin config for role-based group membership rows."""

    list_display = ("id", "group", "user", "role", "joined_at")
    search_fields = ("group__name", "user__username")
    list_filter = ("role", "joined_at")
