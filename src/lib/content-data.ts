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
    title: "Disco 2024 Tournament Finals",
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
    title: "New Meta Breakdown - Season 5",
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
    type: "article",
    title: "Patch Notes 3.2 - Major Balance Changes",
    author: "GameDevs",
    date: "Feb 10, 2026",
    thumbnail:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80",
    likes: 2100,
    comments: 156,
    category: "patches",
  },
  {
    id: "4",
    type: "video",
    title: "Top 5 Clutch Plays This Week",
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
    type: "article",
    title: "Esports Calendar: March Events",
    author: "ProGamingLeague",
    date: "Feb 08, 2026",
    thumbnail:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80",
    likes: 640,
    comments: 38,
    category: "esports",
  },
  {
    id: "6",
    type: "video",
    title: "Aim Training Routine in 60s",
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
    type: "article",
    title: "Balance Hotfix 3.2.1 Released",
    author: "GameDevs",
    date: "Feb 06, 2026",
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
    likes: 525,
    comments: 41,
    category: "patches",
  },
  {
    id: "8",
    type: "video",
    title: "Live Scrim Analysis: Team Rotations",
    author: "StreamScout",
    date: "Feb 05, 2026",
    duration: "1:41",
    thumbnail:
      "https://images.unsplash.com/photo-1548686304-89d188a80029?w=600&q=80",
    likes: 702,
    comments: 63,
    category: "streams",
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
];
