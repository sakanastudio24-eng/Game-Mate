export type NewsCategoryId = "fyp" | "esports" | "patches" | "streams";

export interface NewsFeedItem {
  id: string;
  type: "video" | "article";
  title: string;
  author: string;
  date: string;
  duration?: string;
  thumbnail: string;
  likes: number;
  comments: number;
  category: NewsCategoryId;
}

export interface GroupListItem {
  id: string;
  name: string;
  game: string;
  date?: string;
  members: number;
  online: number;
  thumbnail: string;
  verified: boolean;
}

export interface SuggestedGroupItem {
  id: string;
  name: string;
  game: string;
  members: number;
  online: number;
  thumbnail: string;
}

export const NEWS_PAGE_SIZE = 3;
export const GROUPS_PAGE_SIZE = 3;

let isHomeContentPrimed = false;

export function primeHomeContentCache(): void {
  isHomeContentPrimed = true;
}

export function homeContentPrimed(): boolean {
  return isHomeContentPrimed;
}

export const AUTHOR_AVATARS: Record<string, string> = {
  ProGamingLeague:
    "https://images.unsplash.com/photo-1759701546655-d90ec831aa52?w=100&h=100&fit=crop",
  GameStrategy:
    "https://images.unsplash.com/photo-1622349851524-890cc3641b87?w=100&h=100&fit=crop",
  GameDevs:
    "https://images.unsplash.com/photo-1613063022614-dc11527f5ece?w=100&h=100&fit=crop",
  StreamScout:
    "https://images.unsplash.com/photo-1628501899963-43bb8e2423e1?w=100&h=100&fit=crop",
  MetaWatch:
    "https://images.unsplash.com/photo-1613063022614-dc11527f5ece?w=100&h=100&fit=crop",
};

export const NEWS_FEED: NewsFeedItem[] = [
  {
    id: "1",
    type: "video",
    title: "Disco 2024 Tournament Finals Recap",
    author: "ProGamingLeague",
    date: "Aug 25, 2026",
    duration: "1:20",
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
    likes: 1240,
    comments: 89,
    category: "fyp",
  },
  {
    id: "2",
    type: "video",
    title: "New Meta Breakdown Season 5 Tier List",
    author: "GameStrategy",
    date: "Feb 12, 2026",
    duration: "0:58",
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80",
    likes: 856,
    comments: 45,
    category: "fyp",
  },
  {
    id: "3",
    type: "video",
    title: "Patch Notes 3.2 Fast Breakdown",
    author: "GameDevs",
    date: "Feb 10, 2026",
    duration: "1:16",
    thumbnail:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80",
    likes: 2100,
    comments: 156,
    category: "patches",
  },
  {
    id: "4",
    type: "video",
    title: "Top 5 Clutch Plays This Week Ranked",
    author: "StreamScout",
    date: "Feb 09, 2026",
    duration: "2:03",
    thumbnail:
      "https://images.unsplash.com/photo-1511882150382-421056c89033?w=600&q=80",
    likes: 930,
    comments: 74,
    category: "streams",
  },
  {
    id: "5",
    type: "video",
    title: "Esports Calendar March Events Explained",
    author: "ProGamingLeague",
    date: "Feb 08, 2026",
    duration: "1:12",
    thumbnail:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80",
    likes: 640,
    comments: 38,
    category: "esports",
  },
  {
    id: "6",
    type: "video",
    title: "Aim Training Routine in 60 Seconds",
    author: "MetaWatch",
    date: "Feb 07, 2026",
    duration: "1:00",
    thumbnail:
      "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=600&q=80",
    likes: 788,
    comments: 56,
    category: "fyp",
  },
  {
    id: "7",
    type: "video",
    title: "Balance Hotfix 3.2.1 Released Today",
    author: "GameDevs",
    date: "Feb 06, 2026",
    duration: "0:54",
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
    likes: 525,
    comments: 41,
    category: "patches",
  },
  {
    id: "8",
    type: "video",
    title: "Live Scrim Analysis Team Rotations",
    author: "StreamScout",
    date: "Feb 05, 2026",
    duration: "1:41",
    thumbnail:
      "https://images.unsplash.com/photo-1548686304-89d188a80029?w=600&q=80",
    likes: 702,
    comments: 63,
    category: "streams",
  },
  {
    id: "9",
    type: "video",
    title: "Controller Settings Pros Are Using Now",
    author: "GameStrategy",
    date: "Feb 04, 2026",
    duration: "1:27",
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
    likes: 834,
    comments: 72,
    category: "fyp",
  },
  {
    id: "10",
    type: "video",
    title: "Underrated Team Comps You Should Try",
    author: "MetaWatch",
    date: "Feb 03, 2026",
    duration: "1:35",
    thumbnail:
      "https://images.unsplash.com/photo-1511882150382-421056c89033?w=600&q=80",
    likes: 765,
    comments: 58,
    category: "esports",
  },
];

export const MY_GROUPS: GroupListItem[] = [
  {
    id: "1",
    name: "Disco 2024 Tournament",
    game: "Overwatch",
    date: "Aug 25, 2026",
    members: 12,
    online: 8,
    thumbnail:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=700&q=80",
    verified: true,
  },
  {
    id: "2",
    name: "Arc Raiders Squad",
    game: "Arc Raiders",
    members: 8,
    online: 3,
    thumbnail:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=700&q=80",
    verified: false,
  },
  {
    id: "3",
    name: "Valorant Grinders",
    game: "Valorant",
    members: 24,
    online: 15,
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&q=80",
    verified: true,
  },
  {
    id: "4",
    name: "Night Owls Ranked",
    game: "League of Legends",
    members: 19,
    online: 7,
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=700&q=80",
    verified: false,
  },
  {
    id: "5",
    name: "Apex Fast Queue",
    game: "Apex Legends",
    members: 10,
    online: 5,
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&q=80",
    verified: true,
  },
  {
    id: "6",
    name: "Rocket League Rotations",
    game: "Rocket League",
    members: 14,
    online: 6,
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=700&q=80",
    verified: false,
  },
  {
    id: "7",
    name: "Marvel Rivals Night Squad",
    game: "Marvel Rivals",
    members: 16,
    online: 9,
    thumbnail:
      "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=700&q=80",
    verified: true,
  },
  {
    id: "8",
    name: "Fortnite Build Battles",
    game: "Fortnite",
    members: 20,
    online: 10,
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&q=80",
    verified: false,
  },
  {
    id: "9",
    name: "Overwatch Support Mains",
    game: "Overwatch 2",
    members: 18,
    online: 7,
    thumbnail:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=700&q=80",
    verified: true,
  },
  {
    id: "10",
    name: "Minecraft Co-op Builders",
    game: "Minecraft",
    members: 22,
    online: 11,
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=700&q=80",
    verified: false,
  },
];

export const SUGGESTED_GROUPS: SuggestedGroupItem[] = [
  {
    id: "s1",
    name: "CS2 Pro League",
    game: "Counter-Strike 2",
    members: 156,
    online: 89,
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80",
  },
  {
    id: "s2",
    name: "Chill Gaming Nights",
    game: "Various",
    members: 45,
    online: 12,
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",
  },
  {
    id: "s3",
    name: "Racing Sundays",
    game: "Forza",
    members: 36,
    online: 9,
    thumbnail:
      "https://images.unsplash.com/photo-1462392246754-28dfa2df8e6b?w=400&q=80",
  },
  {
    id: "s4",
    name: "Valorant Diamond Stack",
    game: "Valorant",
    members: 92,
    online: 46,
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80",
  },
  {
    id: "s5",
    name: "Late Night Apex Queue",
    game: "Apex Legends",
    members: 74,
    online: 29,
    thumbnail:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80",
  },
  {
    id: "s6",
    name: "Rocket League Rotations",
    game: "Rocket League",
    members: 53,
    online: 20,
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=420&q=80",
  },
  {
    id: "s7",
    name: "Marvel Rivals Night Squad",
    game: "Marvel Rivals",
    members: 61,
    online: 24,
    thumbnail:
      "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&q=80",
  },
  {
    id: "s8",
    name: "Overwatch Support Mains",
    game: "Overwatch 2",
    members: 88,
    online: 41,
    thumbnail:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&q=80",
  },
  {
    id: "s9",
    name: "Fortnite Build Battles",
    game: "Fortnite",
    members: 67,
    online: 31,
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=420&q=80",
  },
  {
    id: "s10",
    name: "Minecraft Co-op Builders",
    game: "Minecraft",
    members: 49,
    online: 15,
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=420&q=80",
  },
];
