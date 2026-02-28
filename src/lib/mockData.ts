// Mock data for GameMate development and testing

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  game: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  category: 'fyp' | 'esports' | 'patches' | 'streams';
}

export interface Group {
  id: string;
  name: string;
  game: string;
  game_icon?: string;
  members: number;
  maxMembers?: number;
  mode: 'ranked' | 'casual';
  minRank?: string;
  maxRank?: string;
  description: string;
  leader?: string;
  memberList?: string[];
  requiresMic?: boolean;
}

export interface Friend {
  id: string;
  name: string;
  rank: string;
  status: 'online' | 'offline' | 'in-game';
  currentGame?: string;
  avatar?: string;
  isFriend: boolean;
  mutualGames?: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  rank: string;
  level: number;
  gamesPlayed: number;
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
    id: '1',
    authorName: 'Pro Gaming League',
    authorAvatar: '🏆',
    game: 'Valorant',
    content: 'Finals are coming up! Who are you rooting for?',
    likes: 1234,
    comments: 89,
    shares: 45,
    timestamp: '2h ago',
    category: 'esports',
  },
  {
    id: '2',
    authorName: 'Game Patches',
    authorAvatar: '🔧',
    game: 'League of Legends',
    content: 'New champion balance changes - Patch 14.3 is live!',
    likes: 956,
    comments: 234,
    shares: 120,
    timestamp: '4h ago',
    category: 'patches',
  },
  {
    id: '3',
    authorName: 'Twitch Streams',
    authorAvatar: '▶️',
    game: 'CS:GO',
    content: 'Live now: Pro tournament final match - watch it here!',
    likes: 2341,
    comments: 567,
    shares: 234,
    timestamp: '1h ago',
    category: 'streams',
  },
  {
    id: '4',
    authorName: 'Gaming News Daily',
    authorAvatar: '📰',
    game: 'Overall',
    content: 'Top 10 games to watch this month',
    likes: 678,
    comments: 145,
    shares: 89,
    timestamp: '6h ago',
    category: 'fyp',
  },
];

// Mock groups
export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Valorant Grinders',
    game: 'Valorant',
    members: 4,
    maxMembers: 5,
    mode: 'ranked',
    minRank: 'Gold',
    maxRank: 'Immortal',
    description: 'Serious ranked grind, daily sessions',
    leader: 'ProGamer92',
    requiresMic: true,
  },
  {
    id: '2',
    name: 'Chill Gaming Squad',
    game: 'League of Legends',
    members: 3,
    maxMembers: 5,
    mode: 'casual',
    description: 'Fun casual games, no pressure',
    leader: 'SkyWalker',
    requiresMic: false,
  },
  {
    id: '3',
    name: 'CS:GO Competitive',
    game: 'CS:GO',
    members: 5,
    maxMembers: 5,
    mode: 'ranked',
    minRank: 'Silver',
    description: 'Competitive matching, regular matches',
    leader: 'EchoPlayer',
    requiresMic: true,
  },
];

// Mock friends/users
export const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'ProGamer92',
    rank: 'Diamond',
    status: 'online',
    currentGame: 'Valorant',
    avatar: '👾',
    isFriend: true,
    mutualGames: ['Valorant', 'CS:GO', 'Apex'],
  },
  {
    id: '2',
    name: 'SkyWalker',
    rank: 'Platinum',
    status: 'offline',
    avatar: '🎮',
    isFriend: true,
    mutualGames: ['League of Legends', 'Valorant'],
  },
  {
    id: '3',
    name: 'EchoPlayer',
    rank: 'Gold',
    status: 'in-game',
    currentGame: 'CS:GO',
    avatar: '🎯',
    isFriend: true,
    mutualGames: ['CS:GO', 'Valorant'],
  },
  {
    id: '4',
    name: 'NovaStrike',
    rank: 'Diamond',
    status: 'online',
    currentGame: 'Overwatch 2',
    avatar: '⚡',
    isFriend: false,
    mutualGames: ['Overwatch 2', 'Apex'],
  },
];

// Current user profile
export const mockCurrentUser: User = {
  id: 'user-123',
  username: 'YourUsername',
  email: 'you@example.com',
  rank: 'Platinum',
  level: 32,
  gamesPlayed: 247,
  totalHours: 1240,
  favoriteGames: ['Valorant', 'League of Legends', 'CS:GO'],
  bio: 'Competitive gamer | Always grinding | Let\'s queue!',
  avatar: '🎮',
  joinDate: '2023-06-15',
  achievements: 12,
  badges: ['Ranked Grinder', 'Team Player', 'Streamer'],
  stats: {
    wins: 156,
    losses: 91,
    winRate: 63.2,
  },
};

// Mock messages
export const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'ProGamer92',
    text: 'Hey! Want to queue ranked?',
    timestamp: '5 min ago',
    isCurrentUser: false,
  },
  {
    id: '2',
    sender: 'You',
    text: 'Sure! Give me 5 mins',
    timestamp: '3 min ago',
    isCurrentUser: true,
  },
  {
    id: '3',
    sender: 'ProGamer92',
    text: 'Cool, I\'ll start the group',
    timestamp: '2 min ago',
    isCurrentUser: false,
  },
  {
    id: '4',
    sender: 'You',
    text: 'Thanks!',
    timestamp: '1 min ago',
    isCurrentUser: true,
  },
];

// All games available
export const allGames = [
  'Valorant',
  'League of Legends',
  'CS:GO',
  'Overwatch 2',
  'Apex Legends',
  'Fortnite',
  'Dota 2',
  'PUBG',
];

// QR code mock data
export const mockQRCode = {
  url: 'https://gamemate.app/user/user-123',
  customColor: '#FF9F66',
  shareUrl: 'https://gamemate.app/add-friend/user-123',
};

export const mockData = {
  posts: mockPosts,
  groups: mockGroups,
  friends: mockFriends,
  currentUser: mockCurrentUser,
  messages: mockMessages,
  games: allGames,
  qrCode: mockQRCode,
};
