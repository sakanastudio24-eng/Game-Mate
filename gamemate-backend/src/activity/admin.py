from django.contrib import admin

from .models import Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "type", "object_id", "created_at")
    search_fields = ("user__username", "user__email", "type")
    list_filter = ("type", "created_at")
