import { motion } from 'motion/react';
import { ArrowLeft, MessageSquare, UserPlus, Users, Calendar, Gamepad2, MoreVertical, Shield, CheckCircle } from 'lucide-react';
import { Trophy, Medal, Star } from '@phosphor-icons/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UserProfileScreenProps {
  user: any;
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1642792247757-c212e8ba9af9?w=400&h=400&fit=crop';

export function UserProfileScreen({ user, onBack, onNavigate }: UserProfileScreenProps) {
  const [isFriend, setIsFriend] = useState(user?.isFriend || false);

  const stats = [
    { label: 'Groups', value: user?.groups || '8', icon: Users, color: '#FF9F66' },
    { label: 'Events', value: user?.events || '24', icon: Calendar, color: '#66BAFF' },
    { label: 'Wins', value: user?.wins || '89', icon: Trophy as any, color: '#FFD700' },
    { label: 'Hours', value: user?.hours || '1.2K', icon: Gamepad2, color: '#4ADE80' },
  ];

  const achievements = [
    { name: 'Champion', Icon: Trophy, rarity: 'legendary', color: '#FFD700' },
    { name: 'Gold Medal', Icon: Medal, rarity: 'epic', color: '#9B59B6' },
    { name: 'Rising Star', Icon: Star, rarity: 'rare', color: '#3498DB' },
  ];

  const games = [
    { name: 'Overwatch', hours: 340, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&q=80' },
    { name: 'Valorant', hours: 280, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&q=80' },
    { name: 'CS2', hours: 210, image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&q=80' },
    { name: 'Apex', hours: 150, image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=300&q=80' },
  ];

  const mutualGroups = [
    { name: 'Disco 2024 Tournament', members: 12 },
    { name: 'Arc Raiders Squad', members: 8 },
  ];

  const handleAddFriend = () => {
    setIsFriend(!isFriend);
    toast.success(isFriend ? 'Friend removed' : 'Friend request sent!', { duration: 2000 });
  };

  const handleMessage = () => {
    onNavigate('chat', { user: user?.name || 'PlayerHater', userId: user?.id || 1 });
  };

  const avatarUrl = user?.avatar || FALLBACK_AVATAR;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5]"
    >
      {/* Cover */}
      <div className="relative">
        <div className="h-36 bg-gradient-to-br from-[#FF9F66] via-[#FF7733] to-[#cc5500] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 20px)' }}
          />
        </div>

        <div className="absolute top-6 left-6 right-6 flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-11 h-11 bg-[#1A1A1A]/70 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-11 h-11 bg-[#1A1A1A]/70 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10"
          >
            <MoreVertical className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Profile Info */}
        <div className="px-6 -mt-16 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative inline-block"
          >
            <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-br from-[#FF9F66] to-[#FF7733]">
              <img
                src={avatarUrl}
                alt={user?.name}
                className="w-full h-full rounded-full object-cover border-4 border-[#1A1A1A]"
              />
            </div>
            {user?.isOnline !== false && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-2 right-1 w-5 h-5 bg-[#4ADE80] rounded-full border-[3px] border-[#1A1A1A]"
              />
            )}
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 mb-6"
          >
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{user?.name || 'PlayerHater'}</h1>
              {user?.isVerified && (
                <CheckCircle className="w-5 h-5 text-[#FF9F66]" fill="currentColor" strokeWidth={0} />
              )}
            </div>
            <div className="flex items-center gap-2 text-[#A0A0A0] text-sm mb-3">
              <Gamepad2 className="w-4 h-4" />
              <span>{user?.status || 'Online · Playing Overwatch'}</span>
            </div>
            <p className="text-sm text-[#A0A0A0] mb-4 leading-relaxed">
              {user?.bio || 'Competitive player · Love team games · Always ready for a challenge'}
            </p>

            {mutualGroups.length > 0 && (
              <div className="mb-4 p-3 bg-[#242424] border border-[#333] rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-[#FF9F66]" />
                  <span className="text-xs text-[#A0A0A0]">{mutualGroups.length} mutual groups</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {mutualGroups.map((group) => (
                    <div key={group.name} className="text-xs bg-[#333] border border-[#444] px-2 py-1 rounded-full">
                      {group.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleMessage}
                className="flex-1 bg-[#FF9F66] text-[#1A1A1A] py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Message
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleAddFriend}
                className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border ${
                  isFriend
                    ? 'bg-[#242424] border-[#333] text-[#F5F5F5]'
                    : 'bg-[#4ADE80] border-[#4ADE80] text-[#1A1A1A]'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                {isFriend ? 'Friends' : 'Add Friend'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 space-y-8 pb-10">
        {/* Stats */}
        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold mb-4">Stats</h2>
          <div className="grid grid-cols-4 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#242424] border border-[#333] rounded-2xl p-3 text-center"
                >
                  <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: stat.color }} />
                  <div className="text-lg font-bold mb-0.5">{stat.value}</div>
                  <div className="text-xs text-[#A0A0A0]">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement, index) => {
              const AchIcon = achievement.Icon;
              return (
                <motion.div
                  key={achievement.name}
                  initial={{ rotate: -5, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#242424] border-2 rounded-2xl p-4 text-center"
                  style={{ borderColor: achievement.color + '40' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: achievement.color + '20' }}
                  >
                    <AchIcon size={22} weight="fill" color={achievement.color} />
                  </div>
                  <div className="text-xs font-bold">{achievement.name}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Games */}
        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Top Games</h2>
            <span className="text-sm text-[#A0A0A0]">{games.length} games</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {games.map((game, index) => (
              <motion.div
                key={game.name}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                whileHover={{ scale: 1.04 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
              >
                <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-sm font-bold truncate">{game.name}</div>
                  <div className="text-xs text-[#A0A0A0]">{game.hours}h</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
