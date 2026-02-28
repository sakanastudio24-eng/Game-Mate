import { motion } from 'motion/react';
import { ArrowLeft, Settings, Users, Calendar, MessageCircle, Share2, Bell, Send, CheckCircle } from 'lucide-react';
import { Crown, ShieldCheck } from '@phosphor-icons/react';
import { useState } from 'react';

interface GroupDetailScreenProps {
  group: any;
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

const MEMBER_AVATARS: Record<string, string> = {
  PlayerKing: 'https://images.unsplash.com/photo-1613063022614-dc11527f5ece?w=200&h=200&fit=crop',
  GamerPro: 'https://images.unsplash.com/photo-1757773873686-2257941bbcb8?w=200&h=200&fit=crop',
  NoobMaster: 'https://images.unsplash.com/photo-1628501899963-43bb8e2423e1?w=200&h=200&fit=crop',
  EliteSniper: 'https://images.unsplash.com/photo-1622349851524-890cc3641b87?w=200&h=200&fit=crop',
  TacticalGamer: 'https://images.unsplash.com/photo-1725272480173-c858b5acbc82?w=200&h=200&fit=crop',
  CasualPlayer: 'https://images.unsplash.com/photo-1572704764530-5b5da1f5a973?w=200&h=200&fit=crop',
};

export function GroupDetailScreen({ group, onBack, onNavigate }: GroupDetailScreenProps) {
  /** Controls which content tab is displayed */
  const [activeTab, setActiveTab] = useState<'chat' | 'members' | 'events'>('chat');
  /** Controlled value of the group chat message composer */
  const [chatMessage, setChatMessage] = useState('');
  /** Group chat message history — seed data; replace with Supabase Realtime in production */
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'PlayerKing', message: 'Ready for tonight\'s match?', time: '2m ago' },
    { id: 2, user: 'GamerPro', message: 'Let\'s run some practice first', time: '5m ago' },
    { id: 3, user: 'NoobMaster', message: 'I\'m in! What time?', time: '8m ago' }
  ]);

  const members = [
    { id: 1, name: 'PlayerKing', status: 'online', role: 'admin', game: 'Playing Overwatch' },
    { id: 2, name: 'GamerPro', status: 'online', role: 'moderator', game: 'In Queue' },
    { id: 3, name: 'NoobMaster', status: 'online', role: 'member', game: 'Playing Overwatch' },
    { id: 4, name: 'EliteSniper', status: 'online', role: 'member', game: 'Playing Overwatch' },
    { id: 5, name: 'TacticalGamer', status: 'offline', role: 'member', game: '' },
    { id: 6, name: 'CasualPlayer', status: 'offline', role: 'member', game: '' }
  ];

  const events = [
    { id: 1, title: 'Tournament Finals', date: 'Tomorrow', time: '7:00 PM', participants: 12 },
    { id: 2, title: 'Practice Session', date: 'Today', time: '9:00 PM', participants: 8 },
    { id: 3, title: 'Strategy Meeting', date: 'Feb 20', time: '6:00 PM', participants: 6 }
  ];

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        user: 'You',
        message: chatMessage,
        time: 'Just now'
      }]);
      setChatMessage('');
    }
  };

  const roleIcon = (role: string) => {
    if (role === 'admin') return <Crown size={16} weight="fill" color="#FFD700" />;
    if (role === 'moderator') return <ShieldCheck size={16} weight="fill" color="#FF9F66" />;
    return null;
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-[#1A1A1A] text-[#F5F5F5] z-50 flex flex-col"
    >
      {/* Hero */}
      <div className="relative h-56 flex-shrink-0">
        <img
          src={group?.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80'}
          alt={group?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/60 to-transparent" />

        {/* Controls */}
        <div className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-11 h-11 bg-[#1A1A1A]/70 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex gap-2">
            {[Bell, Share2, Settings].map((Icon, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="w-11 h-11 bg-[#1A1A1A]/70 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10"
              >
                <Icon className="w-5 h-5" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Group Info */}
        <div className="absolute bottom-5 left-6 right-6">
          <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            {group?.isVerified && (
              <div className="inline-flex items-center gap-1.5 bg-[#FF9F66] text-[#1A1A1A] px-3 py-1 rounded-full text-xs font-bold mb-2">
                <CheckCircle className="w-3 h-3" />
                Verified
              </div>
            )}
            <h1 className="text-2xl font-bold mb-1">{group?.name}</h1>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-[#A0A0A0]">
                <Users className="w-4 h-4" />
                {group?.members} members
              </span>
              <span className="flex items-center gap-1.5 text-[#4ADE80]">
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 bg-[#4ADE80] rounded-full block"
                />
                {group?.online} online
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] flex-shrink-0">
        <div className="flex">
          {([
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'events', label: 'Events', icon: Calendar }
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 relative"
              >
                <div className={`flex items-center justify-center gap-2 py-4 transition-colors ${
                  activeTab === tab.id ? 'text-[#FF9F66]' : 'text-[#A0A0A0]'
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-bold">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeGroupTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF9F66]"
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-4 pb-24">
            {chatMessages.map((msg, index) => {
              const isMe = msg.user === 'You';
              const avatar = MEMBER_AVATARS[msg.user];
              return (
                <motion.div
                  key={msg.id}
                  initial={{ x: isMe ? 20 : -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.08 }}
                  className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  {!isMe && (
                    avatar
                      ? <img src={avatar} alt={msg.user} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-[#333]" />
                      : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF9F66] to-[#FF7733] flex-shrink-0" />
                  )}
                  <div className={`flex-1 ${isMe ? 'flex flex-col items-end' : ''}`}>
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold">{msg.user}</span>
                        <span className="text-xs text-[#A0A0A0]">{msg.time}</span>
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
                      isMe
                        ? 'bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A] rounded-tr-sm'
                        : 'bg-[#242424] text-[#F5F5F5] rounded-tl-sm'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    {isMe && <span className="text-xs text-[#A0A0A0] mt-1">{msg.time}</span>}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'members' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-3">
            {members.map((member, index) => {
              const avatar = MEMBER_AVATARS[member.name];
              return (
                <motion.div
                  key={member.id}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#242424] rounded-2xl p-4 flex items-center gap-3 border border-[#333]"
                >
                  <div className="relative flex-shrink-0">
                    {avatar
                      ? <img src={avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border border-[#444]" />
                      : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9F66] to-[#FF7733]" />
                    }
                    {member.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4ADE80] rounded-full border-2 border-[#242424]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-bold truncate">{member.name}</span>
                      {roleIcon(member.role)}
                    </div>
                    <p className="text-sm text-[#A0A0A0] truncate">
                      {member.game || 'Offline'}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-[#333] rounded-full text-sm font-bold flex-shrink-0"
                  >
                    View
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#242424] border border-[#333] rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1.5">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                  </div>
                  <div className="bg-[#FF9F66]/15 text-[#FF9F66] px-3 py-1 rounded-full text-sm font-bold border border-[#FF9F66]/30">
                    {event.participants} going
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#FF9F66] text-[#1A1A1A] py-3 rounded-xl font-bold"
                >
                  Join Event
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Chat Input (only in chat tab) */}
      {activeTab === 'chat' && (
        <div className="flex-shrink-0 bg-[#1A1A1A] border-t border-[#2A2A2A] p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-[#242424] border border-[#333] rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#FF9F66]/50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                chatMessage.trim() ? 'bg-[#FF9F66]' : 'bg-[#242424]'
              }`}
            >
              <Send className={`w-5 h-5 ${chatMessage.trim() ? 'text-[#1A1A1A]' : 'text-[#A0A0A0]'}`} />
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}