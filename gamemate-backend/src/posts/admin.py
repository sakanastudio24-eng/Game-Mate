from django.contrib import admin
from .models import Post, PostInteraction, PostShare

admin.site.register(Post)
admin.site.register(PostInteraction)
admin.site.register(PostShare)
