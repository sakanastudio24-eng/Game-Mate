from django.contrib import admin
from .models import Post, PostInteraction

admin.site.register(Post)
admin.site.register(PostInteraction)
