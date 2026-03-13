"""Admin registrations for account and profile models."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Profile, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Admin config for the custom email-first user model."""

    list_display = ("id", "email", "username", "is_staff", "is_active")
    search_fields = ("email", "username")
    ordering = ("id",)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Admin config for public profile fields and lookup."""

    list_display = ("id", "user", "avatar_url", "created_at")
    search_fields = ("user__email", "user__username")
