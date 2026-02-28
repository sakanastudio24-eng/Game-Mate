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
    name: "Valorant Grinders",
    game: "Valorant",
    members: ["ProGamer92", "SkyWalker", "EchoPlayer", "You"],
    memberCount: 4,
    maxMembers: 5,
    mode: "ranked",
    minRank: "Gold",
    maxRank: "Immortal",
    description: "Serious ranked grind, daily sessions",
    leader: "ProGamer92",
    micRequired: true,
    requiresMic: true,
  },
  {
    id: "2",
    name: "Chill Gaming Squad",
    game: "League of Legends",
    members: ["NovaStrike", "PixelMage", "You"],
    memberCount: 3,
    maxMembers: 5,
    mode: "casual",
    description: "Fun casual games, no pressure",
    leader: "SkyWalker",
    micRequired: false,
    requiresMic: false,
  },
  {
    id: "3",
    name: "CS2 Competitive",
    game: "CS2",
    members: ["EchoPlayer", "ProGamer92", "You", "ApexDroid", "TacticalFox"],
    memberCount: 5,
    maxMembers: 5,
    mode: "ranked",
    minRank: "Silver",
    description: "Competitive matching, regular matches",
    leader: "EchoPlayer",
    micRequired: true,
    requiresMic: true,
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
