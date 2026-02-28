import { motion } from 'motion/react';
import { QrCode, Search, UserPlus, MessageSquare, Users } from 'lucide-react';
import { GameController, ChatText } from '@phosphor-icons/react';
import { useState } from 'react';

interface SocialScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

const AVATARS = {
  PlayerHater: 'https://images.unsplash.com/photo-1642792247757-c212e8ba9af9?w=200&h=200&fit=crop',
  PlayerLover: 'https://images.unsplash.com/photo-1572704764530-5b5da1f5a973?w=200&h=200&fit=crop',
  GamerPro: 'https://images.unsplash.com/photo-1759701546655-d90ec831aa52?w=200&h=200&fit=crop',
  PlayerKiller: 'https://images.unsplash.com/photo-1599220274056-a6cdbe06c2c0?w=200&h=200&fit=crop',
  PlayerEater: 'https://images.unsplash.com/photo-1637767125552-b89f5e1ab923?w=200&h=200&fit=crop',
  NoobMaster: 'https://images.unsplash.com/photo-1633286464918-4d78c8424b59?w=200&h=200&fit=crop',
  EliteSniper: 'https://images.unsplash.com/photo-1613063022614-dc11527f5ece?w=200&h=200&fit=crop',
  CasualGamer: 'https://images.unsplash.com/photo-1628501899963-43bb8e2423e1?w=200&h=200&fit=crop',
};

export function SocialScreen({ onNavigate }: SocialScreenProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'messages' | 'requests'>('friends');

  const onlineFriends = [
    { id: 1, name: 'PlayerHater', game: 'Playing Overwatch', status: 'In Competitive', level: 45 },
    { id: 2, name: 'PlayerLover', game: 'Playing Valorant', status: 'In Queue', level: 38 },
    { id: 3, name: 'GamerPro', game: 'Playing CS2', status: 'In Match', level: 52 },
  ];

  const offlineFriends = [
    { id: 4, name: 'PlayerKiller', lastSeen: '2 hours ago', level: 42 },
    { id: 5, name: 'PlayerEater', lastSeen: '1 day ago', level: 28 },
    { id: 6, name: 'NoobMaster', lastSeen: '3 days ago', level: 35 },
  ];

  const messages = [
    { id: 1, user: 'PlayerHater', message: 'Want to queue up?', time: '2m ago', unread: 2, online: true },
    { id: 2, user: 'GamerPro', message: 'GG last night!', time: '1h ago', unread: 0, online: true },
    { id: 3, user: 'PlayerLover', message: 'Check out this new strat', time: '3h ago', unread: 1, online: true },
  ];

  const requests = [
    { id: 1, name: 'EliteSniper', mutualFriends: 5, games: ['Overwatch', 'CS2'] },
    { id: 2, name: 'CasualGamer', mutualFriends: 3, games: ['Valorant'] },
  ];

  const tabs = [
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'requests', label: 'Requests', icon: UserPlus, badge: requests.length },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5] pb-28"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#1A1A1A]/95 backdrop-blur-lg z-10 border-b border-[#2A2A2A]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-4xl font-bold"
            >
              Social
            </motion.h1>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-11 h-11 bg-[#242424] rounded-full flex items-center justify-center border border-[#333]"
              >
                <UserPlus className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('qr')}
                className="w-11 h-11 bg-[#242424] rounded-full flex items-center justify-center border border-[#333]"
              >
                <QrCode className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A]'
                      : 'bg-[#242424] text-[#A0A0A0] border border-[#333]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {'badge' in tab && tab.badge && tab.badge > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF6B6B] rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {tab.badge}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6">

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606060]" />
              <input
                type="text"
                placeholder="Search friends..."
                className="w-full bg-[#242424] border border-[#333] rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#FF9F66]/50 text-sm"
              />
            </div>

            {/* Online */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                Online
                <span className="text-[#4ADE80] text-sm bg-[#4ADE80]/10 border border-[#4ADE80]/20 px-2 py-0.5 rounded-full">
                  {onlineFriends.length}
                </span>
              </h2>
              <div className="space-y-3">
                {onlineFriends.map((friend, index) => (
                  <motion.div
                    key={friend.id}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => onNavigate('user-profile', {
                      name: friend.name,
                      id: friend.id,
                      level: friend.level,
                      status: friend.game,
                      avatar: AVATARS[friend.name as keyof typeof AVATARS],
                      isOnline: true,
                      isFriend: true
                    })}
                    className="bg-[#242424] border border-[#333] rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FF9F66] to-[#FF7733]">
                        <img
                          src={AVATARS[friend.name as keyof typeof AVATARS]}
                          alt={friend.name}
                          className="w-full h-full rounded-full object-cover border-2 border-[#242424]"
                        />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute bottom-0 right-0 w-4 h-4 bg-[#4ADE80] rounded-full border-2 border-[#242424]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold truncate">{friend.name}</h3>
                        <span className="text-xs bg-[#333] border border-[#444] px-2 py-0.5 rounded-full flex-shrink-0">
                          Lvl {friend.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-[#A0A0A0] mb-0.5">
                        <GameController size={14} />
                        <span className="truncate">{friend.game}</span>
                      </div>
                      <p className="text-xs text-[#4ADE80]">{friend.status}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('chat', { user: friend.name, userId: friend.id });
                      }}
                      className="w-11 h-11 bg-[#FF9F66] rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <MessageSquare className="w-5 h-5 text-[#1A1A1A]" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Offline */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                Offline
                <span className="text-[#606060] text-sm bg-[#242424] border border-[#333] px-2 py-0.5 rounded-full">
                  {offlineFriends.length}
                </span>
              </h2>
              <div className="space-y-3">
                {offlineFriends.map((friend, index) => (
                  <motion.div
                    key={friend.id}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-[#242424] border border-[#333] rounded-2xl p-4 flex items-center gap-4 cursor-pointer opacity-50"
                  >
                    <img
                      src={AVATARS[friend.name as keyof typeof AVATARS]}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#444] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold truncate">{friend.name}</h3>
                        <span className="text-xs bg-[#333] px-2 py-0.5 rounded-full flex-shrink-0">
                          Lvl {friend.level}
                        </span>
                      </div>
                      <p className="text-sm text-[#606060]">{friend.lastSeen}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => onNavigate('chat', { user: msg.user, userId: msg.id })}
                className="bg-[#242424] border border-[#333] rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={AVATARS[msg.user as keyof typeof AVATARS]}
                    alt={msg.user}
                    className="w-14 h-14 rounded-full object-cover border border-[#444]"
                  />
                  {msg.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4ADE80] rounded-full border-2 border-[#242424]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold">{msg.user}</h3>
                    <span className="text-xs text-[#606060]">{msg.time}</span>
                  </div>
                  <p className="text-sm text-[#A0A0A0] truncate">{msg.message}</p>
                </div>
                {msg.unread > 0 && (
                  <div className="w-6 h-6 bg-[#FF9F66] rounded-full flex items-center justify-center text-xs font-bold text-[#1A1A1A] flex-shrink-0">
                    {msg.unread}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#242424] border border-[#333] rounded-2xl p-4"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={AVATARS[request.name as keyof typeof AVATARS]}
                    alt={request.name}
                    className="w-14 h-14 rounded-full object-cover border border-[#444] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold mb-1">{request.name}</h3>
                    <p className="text-sm text-[#A0A0A0] mb-2">{request.mutualFriends} mutual friends</p>
                    <div className="flex gap-2 flex-wrap">
                      {request.games.map((game) => (
                        <span key={game} className="text-xs bg-[#333] border border-[#444] px-2 py-0.5 rounded-full">
                          {game}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-[#FF9F66] text-[#1A1A1A] py-3 rounded-xl font-bold"
                  >
                    Accept
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-[#333] text-[#F5F5F5] py-3 rounded-xl font-bold border border-[#444]"
                  >
                    Decline
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
