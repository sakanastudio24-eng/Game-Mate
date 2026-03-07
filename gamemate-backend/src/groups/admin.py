from django.contrib import admin
from .models import Group, GroupMembership


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "is_private", "created_at")
    search_fields = ("name", "owner__username")
    list_filter = ("is_private", "created_at")


@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    list_display = ("id", "group", "user", "role", "joined_at")
    search_fields = ("group__name", "user__username")
    list_filter = ("role", "joined_at")
