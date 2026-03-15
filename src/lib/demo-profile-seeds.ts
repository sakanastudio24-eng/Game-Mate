import type { GroupListItem } from "./content-data";

export const DEMO_SEED_ACCOUNT = {
  email: "all.info@gamemate.dev",
  username: "gamemate_showcase",
  password: "Showcase123!",
} as const;

type DemoProfileVideo = {
  id: string;
  title: string;
  duration: string;
  views: string;
  image: string;
};

type DemoProfileAchievement = {
  name: string;
  icon: string;
  rarity: string;
  color: string;
};

export type DemoProfileSeed = {
  key: string;
  defaultStatus: "online" | "away" | "busy" | "invisible" | "offline";
  videos: DemoProfileVideo[];
  achievements: DemoProfileAchievement[];
  groups: GroupListItem[];
};

const showcaseSeed: DemoProfileSeed = {
  key: DEMO_SEED_ACCOUNT.username,
  defaultStatus: "online",
  videos: [
    {
      id: "showcase-1",
      title: "Ascent Retake With Zero Utility Waste",
      duration: "0:48",
      views: "18.4K",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
    },
    {
      id: "showcase-2",
      title: "Difficulty 9 Loadout That Still Clears Fast",
      duration: "1:04",
      views: "12.7K",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80",
    },
    {
      id: "showcase-3",
      title: "Two Touches That Turn Defense Into a Goal",
      duration: "0:39",
      views: "9.8K",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
    },
    {
      id: "showcase-4",
      title: "Corner Pressure Sequence I Use Every Set",
      duration: "0:56",
      views: "7.1K",
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80",
    },
  ],
  achievements: [
    {
      name: "Tournament Ready",
      icon: "trophy-variant-outline",
      rarity: "Rare",
      color: "#F59E0B",
    },
    {
      name: "Squad Captain",
      icon: "account-group-outline",
      rarity: "Epic",
      color: "#FB923C",
    },
    {
      name: "VOD Analyst",
      icon: "video-outline",
      rarity: "Uncommon",
      color: "#60A5FA",
    },
    {
      name: "Comms Locked",
      icon: "microphone-outline",
      rarity: "Rare",
      color: "#34D399",
    },
    {
      name: "Win Streak",
      icon: "firework",
      rarity: "Epic",
      color: "#F97316",
    },
    {
      name: "Night Queue",
      icon: "moon-waning-crescent",
      rarity: "Common",
      color: "#A78BFA",
    },
  ],
  groups: [
    {
      id: "showcase-group-1",
      name: "Late Night Ranked Stack",
      game: "Valorant",
      members: 8,
      online: 5,
      thumbnail: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&q=80",
      verified: true,
    },
    {
      id: "showcase-group-2",
      name: "Weekend Raid Crew",
      game: "Helldivers 2",
      members: 12,
      online: 7,
      thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80",
      verified: false,
    },
    {
      id: "showcase-group-3",
      name: "Clip Lab",
      game: "Rocket League",
      members: 15,
      online: 6,
      thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",
      verified: true,
    },
    {
      id: "showcase-group-4",
      name: "FGC Warmup Room",
      game: "Street Fighter 6",
      members: 10,
      online: 4,
      thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&q=80",
      verified: false,
    },
  ],
};

export function getDemoProfileSeedForUser(
  user: { username?: string | null; email?: string | null } | null | undefined,
): DemoProfileSeed | null {
  if (!user) return null;

  const normalizedUsername = user.username?.trim().toLowerCase();
  const normalizedEmail = user.email?.trim().toLowerCase();

  if (
    normalizedUsername === DEMO_SEED_ACCOUNT.username.toLowerCase() ||
    normalizedEmail === DEMO_SEED_ACCOUNT.email.toLowerCase()
  ) {
    return showcaseSeed;
  }

  return null;
}
