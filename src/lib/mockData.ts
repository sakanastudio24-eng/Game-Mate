// Mock data for GameMate development and testing

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  game: string;
  content: string;
  image?: string;
  hashtags: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  category: "fyp" | "esports" | "patches" | "streams";
}

export interface Group {
  id: string;
  name: string;
  game: string;
  game_icon?: string;
  members: string[];
  memberCount: number;
  maxMembers?: number;
  mode: "ranked" | "casual";
  minRank?: string;
  maxRank?: string;
  description: string;
  leader?: string;
  memberList?: string[];
  micRequired?: boolean;
  requiresMic?: boolean;
}

export interface Friend {
  id: string;
  name: string;
  username: string;
  rank: string;
  status: "online" | "offline" | "in-game";
  currentGame?: string;
  avatar?: string;
  isFriend: boolean;
  mutualGames?: string[];
  gamesPlayed: string[];
  lastSeen?: Date;
  groupsJoined?: number;
  level?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  rank: string;
  level: number;
  groupsJoined: number;
  gamesPlayed: string[];
  totalHours: number;
  favoriteGames: string[];
  bio: string;
  avatar: string;
  joinDate: string;
  achievements: number;
  badges: string[];
  stats?: {
    wins: number;
    losses: number;
    winRate: number;
  };
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
  attachment?: string;
}

// Mock posts for news feed
export const mockPosts: Post[] = [
  {
    id: "1",
    authorName: "Pro Gaming League",
    authorAvatar: "🏆",
    game: "Valorant",
    content: "Finals are coming up! Who are you rooting for?",
    hashtags: ["valorant", "esports", "finals"],
    likes: 1234,
    comments: 89,
    shares: 45,
    timestamp: new Date(Date.now() - 2 * 3600000),
    category: "esports",
  },
  {
    id: "2",
    authorName: "Game Patches",
    authorAvatar: "🔧",
    game: "League of Legends",
    content: "New champion balance changes - Patch 14.3 is live!",
    hashtags: ["lol", "patch-notes"],
    likes: 956,
    comments: 234,
    shares: 120,
    timestamp: new Date(Date.now() - 4 * 3600000),
    category: "patches",
  },
  {
    id: "3",
    authorName: "Twitch Streams",
    authorAvatar: "▶️",
    game: "CS2",
    content: "Live now: Pro tournament final match - watch it here!",
    hashtags: ["cs2", "live", "tournament"],
    likes: 2341,
    comments: 567,
    shares: 234,
    timestamp: new Date(Date.now() - 1 * 3600000),
    category: "streams",
  },
  {
    id: "4",
    authorName: "Gaming News Daily",
    authorAvatar: "📰",
    game: "Multi-game",
    content: "Top 10 games to watch this month",
    hashtags: ["fyp", "gaming"],
    likes: 678,
    comments: 145,
    shares: 89,
    timestamp: new Date(Date.now() - 6 * 3600000),
    category: "fyp",
  },
];

// Mock groups
export const mockGroups: Group[] = [
  {
    id: "1",
    name: "CS2 Pro League",
    game: "Counter-Strike 2",
    members: ["ProGamer92", "EchoPlayer", "RiftRunner", "You"],
    memberCount: 4,
    maxMembers: 6,
    mode: "ranked",
    minRank: "Silver",
    maxRank: "Diamond",
    description: "Structured scrims and ranked sessions with callouts.",
    leader: "ProGamer92",
    micRequired: true,
    requiresMic: true,
  },
  {
    id: "2",
    name: "Chill Gaming Nights",
    game: "Various",
    members: ["SkyWalker", "NovaStrike", "PixelMage", "You"],
    memberCount: 4,
    maxMembers: 8,
    mode: "casual",
    description: "Low-pressure queue nights and chill game rotations.",
    leader: "SkyWalker",
    micRequired: false,
    requiresMic: false,
  },
  {
    id: "3",
    name: "Racing Sundays",
    game: "Forza",
    members: ["TurboJax", "GridGhost", "NeonPulse", "You"],
    memberCount: 4,
    maxMembers: 8,
    mode: "casual",
    description: "Weekend races with rotating tracks and leaderboards.",
    leader: "TurboJax",
    micRequired: false,
    requiresMic: false,
  },
  {
    id: "4",
    name: "Valorant Diamond Stack",
    game: "Valorant",
    members: ["ProGamer92", "ApexDroid", "TacticalFox", "You"],
    memberCount: 4,
    maxMembers: 5,
    mode: "ranked",
    minRank: "Gold",
    maxRank: "Immortal",
    description: "Daily high-elo ranked stack focused on utility timing.",
    leader: "ProGamer92",
    micRequired: true,
    requiresMic: true,
  },
  {
    id: "5",
    name: "Late Night Apex Queue",
    game: "Apex Legends",
    members: ["NovaStrike", "StormByte", "ZenCrate", "You"],
    memberCount: 4,
    maxMembers: 6,
    mode: "casual",
    description: "Quick ranked and pubs after 9 PM with clear comms.",
    leader: "NovaStrike",
    micRequired: true,
    requiresMic: true,
  },
  {
    id: "6",
    name: "Rocket League Rotations",
    game: "Rocket League",
    members: ["EchoPlayer", "SkyWalker", "GridGhost", "You"],
    memberCount: 4,
    maxMembers: 6,
    mode: "casual",
    description: "Mechanics drills and 3v3 queue rotations.",
    leader: "EchoPlayer",
    micRequired: false,
    requiresMic: false,
  },
  {
    id: "7",
    name: "Marvel Rivals Night Squad",
    game: "Marvel Rivals",
    members: ["RiftRunner", "NovaStrike", "PixelMage", "You"],
    memberCount: 4,
    maxMembers: 6,
    mode: "casual",
    description: "Nightly comps and role swaps for fast synergy.",
    leader: "RiftRunner",
    micRequired: true,
    requiresMic: true,
  },
  {
    id: "8",
    name: "Overwatch Support Mains",
    game: "Overwatch 2",
    members: ["ZenCrate", "StormByte", "SkyWalker", "You"],
    memberCount: 4,
    maxMembers: 6,
    mode: "ranked",
    minRank: "Gold",
    maxRank: "Master",
    description: "Support-focused ranked sessions with VOD review.",
    leader: "ZenCrate",
    micRequired: true,
    requiresMic: true,
  },
  {
    id: "9",
    name: "Fortnite Build Battles",
    game: "Fortnite",
    members: ["TurboJax", "NeonPulse", "ApexDroid", "You"],
    memberCount: 4,
    maxMembers: 8,
    mode: "casual",
    description: "Build fights and zone wars with custom lobbies.",
    leader: "TurboJax",
    micRequired: false,
    requiresMic: false,
  },
  {
    id: "10",
    name: "Minecraft Co-op Builders",
    game: "Minecraft",
    members: ["PixelMage", "GridGhost", "NovaStrike", "You"],
    memberCount: 4,
    maxMembers: 10,
    mode: "casual",
    description: "Co-op survival worlds and base building events.",
    leader: "PixelMage",
    micRequired: false,
    requiresMic: false,
  },
];

// Mock friends/users
export const mockFriends: Friend[] = [
  {
    id: "1",
    name: "ProGamer92",
    username: "ProGamer92",
    rank: "Diamond",
    status: "online",
    currentGame: "Valorant",
    avatar: "👾",
    isFriend: true,
    mutualGames: ["Valorant", "CS2", "Apex Legends"],
    gamesPlayed: ["Valorant", "CS2", "Apex Legends"],
    groupsJoined: 4,
    level: 28,
  },
  {
    id: "2",
    name: "SkyWalker",
    username: "SkyWalker",
    rank: "Platinum",
    status: "offline",
    avatar: "🎮",
    isFriend: true,
    mutualGames: ["League of Legends", "Valorant"],
    gamesPlayed: ["League of Legends", "Valorant", "Fortnite"],
    lastSeen: new Date(Date.now() - 30 * 60000),
    groupsJoined: 3,
    level: 24,
  },
  {
    id: "3",
    name: "EchoPlayer",
    username: "EchoPlayer",
    rank: "Gold",
    status: "in-game",
    currentGame: "CS2",
    avatar: "🎯",
    isFriend: true,
    mutualGames: ["CS2", "Valorant"],
    gamesPlayed: ["CS2", "Valorant"],
    groupsJoined: 5,
    level: 21,
  },
  {
    id: "4",
    name: "NovaStrike",
    username: "NovaStrike",
    rank: "Diamond",
    status: "online",
    currentGame: "Overwatch 2",
    avatar: "⚡",
    isFriend: false,
    mutualGames: ["Overwatch 2", "Apex Legends"],
    gamesPlayed: ["Overwatch 2", "Apex Legends"],
    groupsJoined: 2,
    level: 19,
  },
  {
    id: "5",
    name: "RiftRunner",
    username: "RiftRunner",
    rank: "Immortal",
    status: "online",
    currentGame: "Valorant",
    avatar: "🔥",
    isFriend: true,
    mutualGames: ["Valorant", "Apex Legends"],
    gamesPlayed: ["Valorant", "Apex Legends", "CS2"],
    groupsJoined: 6,
    level: 33,
  },
  {
    id: "6",
    name: "TurboJax",
    username: "TurboJax",
    rank: "Gold",
    status: "in-game",
    currentGame: "Forza",
    avatar: "🚗",
    isFriend: true,
    mutualGames: ["Forza", "Rocket League"],
    gamesPlayed: ["Forza", "Rocket League", "Fortnite"],
    groupsJoined: 4,
    level: 22,
  },
  {
    id: "7",
    name: "GridGhost",
    username: "GridGhost",
    rank: "Platinum",
    status: "offline",
    avatar: "🧊",
    isFriend: true,
    mutualGames: ["Rocket League", "Minecraft"],
    gamesPlayed: ["Rocket League", "Minecraft", "CS2"],
    lastSeen: new Date(Date.now() - 2 * 3600000),
    groupsJoined: 3,
    level: 20,
  },
  {
    id: "8",
    name: "StormByte",
    username: "StormByte",
    rank: "Diamond",
    status: "online",
    currentGame: "Overwatch 2",
    avatar: "🌩️",
    isFriend: false,
    mutualGames: ["Overwatch 2", "Apex Legends"],
    gamesPlayed: ["Overwatch 2", "Apex Legends"],
    groupsJoined: 2,
    level: 18,
  },
  {
    id: "9",
    name: "ZenCrate",
    username: "ZenCrate",
    rank: "Master",
    status: "in-game",
    currentGame: "Overwatch 2",
    avatar: "🛡️",
    isFriend: false,
    mutualGames: ["Overwatch 2", "Valorant"],
    gamesPlayed: ["Overwatch 2", "Valorant", "CS2"],
    groupsJoined: 5,
    level: 30,
  },
  {
    id: "10",
    name: "NeonPulse",
    username: "NeonPulse",
    rank: "Gold",
    status: "offline",
    avatar: "✨",
    isFriend: false,
    mutualGames: ["Fortnite", "Minecraft"],
    gamesPlayed: ["Fortnite", "Minecraft", "Apex Legends"],
    lastSeen: new Date(Date.now() - 5 * 3600000),
    groupsJoined: 1,
    level: 16,
  },
];

export const mockSuggestedUsers: Friend[] = mockFriends.filter(
  (friend) => !friend.isFriend,
);

// Current user profile
export const mockCurrentUser: User = {
  id: "user-123",
  username: "YourUsername",
  email: "you@example.com",
  rank: "Platinum",
  level: 32,
  groupsJoined: 6,
  gamesPlayed: ["Valorant", "League of Legends", "CS2", "Apex Legends"],
  totalHours: 1240,
  favoriteGames: ["Valorant", "League of Legends", "CS2"],
  bio: "Competitive gamer | Always grinding | Let's queue!",
  avatar: "🎮",
  joinDate: "2023-06-15",
  achievements: 12,
  badges: ["Ranked Grinder", "Team Player", "Streamer"],
  stats: {
    wins: 156,
    losses: 91,
    winRate: 63.2,
  },
};

// Mock messages
export const mockMessages: Message[] = [
  {
    id: "1",
    sender: "ProGamer92",
    text: "Hey! Want to queue ranked?",
    timestamp: "5 min ago",
    isCurrentUser: false,
  },
  {
    id: "2",
    sender: "You",
    text: "Sure! Give me 5 mins",
    timestamp: "3 min ago",
    isCurrentUser: true,
  },
  {
    id: "3",
    sender: "ProGamer92",
    text: "Cool, I'll start the group",
    timestamp: "2 min ago",
    isCurrentUser: false,
  },
  {
    id: "4",
    sender: "You",
    text: "Thanks!",
    timestamp: "1 min ago",
    isCurrentUser: true,
  },
];

// All games available
export const allGames = [
  "Valorant",
  "League of Legends",
  "CS2",
  "Overwatch 2",
  "Apex Legends",
  "Fortnite",
  "Dota 2",
  "PUBG",
];

// QR code mock data
export const mockQRCode = {
  url: "https://gamemate.app/user/user-123",
  customColor: "#FF9F66",
  shareUrl: "https://gamemate.app/add-friend/user-123",
  displayName: "@YourUsername",
  profileUrl: "gamemate.app/user/YourUsername",
};

export const mockData = {
  posts: mockPosts,
  groups: mockGroups,
  friends: mockFriends,
  suggestedUsers: mockSuggestedUsers,
  currentUser: mockCurrentUser,
  messages: mockMessages,
  games: allGames,
  qrCode: mockQRCode,
};
