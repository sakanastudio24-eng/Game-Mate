from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Profile, User
from connections.models import Connection
from groups.models import Group, GroupMembership
from posts.models import Post


DEMO_EMAIL = "all.info@gamemate.dev"
DEMO_USERNAME = "gamemate_showcase"
DEMO_PASSWORD = "Showcase123!"

DEMO_PROFILE = {
    "bio": (
        "Squad builder, ranked grinder, and clip collector. I bounce between tactical FPS, "
        "fighters, and co-op raids, and I am always down to queue with players who communicate."
    ),
    "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    "favorite_games": [
        "Valorant",
        "Helldivers 2",
        "Rocket League",
        "Street Fighter 6",
        "Marvel Rivals",
    ],
}

DEMO_POSTS = [
    {
        "game": "Valorant",
        "title": "Ascent Retake With Zero Utility Waste",
        "description": "Short VOD review breaking down a clean 3v4 retake and comm timing.",
        "video_url": "https://www.youtube.com/watch?v=1roy4o4tqQM",
    },
    {
        "game": "Helldivers 2",
        "title": "Difficulty 9 Loadout That Still Clears Fast",
        "description": "My current anti-armor support setup for coordinated squads.",
        "video_url": "https://www.youtube.com/watch?v=Hh0x-ULZCQs",
    },
    {
        "game": "Rocket League",
        "title": "Two Touches That Turn Defense Into a Goal",
        "description": "A simple training pack routine for faster transition scoring.",
        "video_url": "https://www.youtube.com/watch?v=ljHJvcppGfA",
    },
    {
        "game": "Street Fighter 6",
        "title": "Corner Pressure Sequence I Use Every Set",
        "description": "One pressure route with a safe reset and punish trap built in.",
        "video_url": "https://www.youtube.com/watch?v=Q2nD6O4Jj2E",
    },
]

DEMO_GROUPS = [
    {
        "name": "Late Night Ranked Stack",
        "description": "Competitive comms-first squad for evening ranked sessions.",
        "is_private": False,
    },
    {
        "name": "Weekend Raid Crew",
        "description": "PvE group for longer co-op sessions, clears, and build testing.",
        "is_private": True,
    },
    {
        "name": "Clip Lab",
        "description": "Share VODs, review mistakes, and trade setup tech.",
        "is_private": False,
    },
    {
        "name": "FGC Warmup Room",
        "description": "Run sets, matchup drills, and tournament prep.",
        "is_private": False,
    },
]

DEMO_FRIENDS = [
    {
        "email": "nova.rush@gamemate.dev",
        "username": "nova_rush",
        "bio": "Entry frag and scrim organizer.",
    },
    {
        "email": "pixel.guard@gamemate.dev",
        "username": "pixel_guard",
        "bio": "Support flex and VOD reviewer.",
    },
    {
        "email": "hazard.line@gamemate.dev",
        "username": "hazard_line",
        "bio": "Tank main who always calls targets.",
    },
    {
        "email": "arc.combo@gamemate.dev",
        "username": "arc_combo",
        "bio": "FGC grinder and combo route nerd.",
    },
]


class Command(BaseCommand):
    help = "Create or refresh one fully populated demo account for GameMate."

    @transaction.atomic
    def handle(self, *args, **options):
        demo_user, created = User.objects.get_or_create(
            email=DEMO_EMAIL,
            defaults={"username": DEMO_USERNAME},
        )

        if created:
            demo_user.set_password(DEMO_PASSWORD)
            demo_user.save(update_fields=["password"])
        else:
            changed = False
            if demo_user.username != DEMO_USERNAME:
                demo_user.username = DEMO_USERNAME
                changed = True
            if not demo_user.check_password(DEMO_PASSWORD):
                demo_user.set_password(DEMO_PASSWORD)
                changed = True
            if changed:
                demo_user.save()

        profile, _ = Profile.objects.get_or_create(user=demo_user)
        profile.bio = DEMO_PROFILE["bio"]
        profile.avatar_url = DEMO_PROFILE["avatar_url"]
        profile.favorite_games = DEMO_PROFILE["favorite_games"]
        profile.save(update_fields=["bio", "avatar_url", "favorite_games"])

        for friend_seed in DEMO_FRIENDS:
            friend_user, friend_created = User.objects.get_or_create(
                email=friend_seed["email"],
                defaults={"username": friend_seed["username"]},
            )
            if friend_created:
                friend_user.set_password(DEMO_PASSWORD)
                friend_user.save(update_fields=["password"])
            elif friend_user.username != friend_seed["username"]:
                friend_user.username = friend_seed["username"]
                friend_user.save(update_fields=["username"])

            friend_profile, _ = Profile.objects.get_or_create(user=friend_user)
            friend_profile.bio = friend_seed["bio"]
            friend_profile.favorite_games = DEMO_PROFILE["favorite_games"][:2]
            friend_profile.save(update_fields=["bio", "favorite_games"])

            Connection.objects.update_or_create(
                sender=demo_user,
                receiver=friend_user,
                defaults={"status": "accepted"},
            )

        for post_seed in DEMO_POSTS:
            Post.objects.update_or_create(
                creator=demo_user,
                title=post_seed["title"],
                defaults={
                    "game": post_seed["game"],
                    "description": post_seed["description"],
                    "video_url": post_seed["video_url"],
                    "is_deleted": False,
                    "deleted_at": None,
                },
            )

        for group_seed in DEMO_GROUPS:
            group, _ = Group.objects.update_or_create(
                owner=demo_user,
                name=group_seed["name"],
                defaults={
                    "description": group_seed["description"],
                    "is_private": group_seed["is_private"],
                },
            )
            GroupMembership.objects.update_or_create(
                user=demo_user,
                group=group,
                defaults={"role": GroupMembership.ROLE_OWNER},
            )

        self.stdout.write(self.style.SUCCESS("Demo account ready."))
        self.stdout.write(f"email: {DEMO_EMAIL}")
        self.stdout.write(f"username: {DEMO_USERNAME}")
        self.stdout.write(f"password: {DEMO_PASSWORD}")
