import { motion } from 'motion/react';
import { QrCode, Settings, Gamepad2, Users, Calendar, Pencil, CheckCircle } from 'lucide-react';
import { Trophy, Handshake, Star, Crosshair } from '@phosphor-icons/react';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

const SELF_AVATAR = 'https://images.unsplash.com/photo-1579975979101-7a3c3909d659?w=400&h=400&fit=crop';

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const stats = [
    { label: 'Groups', value: '12', icon: Users, color: '#FF9F66' },
    { label: 'Events', value: '34', icon: Calendar, color: '#66BAFF' },
    { label: 'Wins', value: '156', icon: Trophy, color: '#FFD700' },
    { label: 'Hours', value: '2.4K', icon: Gamepad2, color: '#4ADE80' }
  ];

  const achievements = [
    { name: 'Tournament Winner', Icon: Trophy, rarity: 'legendary', color: '#FFD700' },
    { name: 'Team Player', Icon: Handshake, rarity: 'epic', color: '#9B59B6' },
    { name: 'Veteran', Icon: Star, rarity: 'rare', color: '#3498DB' },
    { name: 'Marksman', Icon: Crosshair, rarity: 'common', color: '#95A5A6' }
  ];

  const games = [
    { name: 'Overwatch', hours: 450, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&q=80' },
    { name: 'Valorant', hours: 320, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&q=80' },
    { name: 'CS2', hours: 280, image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&q=80' },
    { name: 'Apex Legends', hours: 190, image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=300&q=80' },
    { name: 'League of Legends', hours: 150, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&q=80' },
    { name: 'Fortnite', hours: 120, image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5] pb-28"
    >
      {/* Cover + Header */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-[#FF9F66] via-[#FF7733] to-[#cc5500] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 20px)' }}
          />
        </div>

        {/* Header Buttons */}
        <div className="absolute top-6 right-6 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('qr')}
            className="w-11 h-11 bg-[#1A1A1A]/70 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10"
          >
            <QrCode className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('settings')}
            className="w-11 h-11 bg-[#1A1A1A]/70 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10"
          >
            <Settings className="w-5 h-5" />
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
            <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-br from-[#FF9F66] to-[#FF7733]">
              <img
                src={SELF_AVATAR}
                alt="PlayerMaker34"
                className="w-full h-full rounded-full object-cover border-4 border-[#1A1A1A]"
              />
            </div>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-2 right-2 w-5 h-5 bg-[#4ADE80] rounded-full border-[3px] border-[#1A1A1A]"
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 mb-6"
          >
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">PlayerMaker34</h1>
              <div className="bg-[#FF9F66] rounded-full p-[3px]">
                <CheckCircle className="w-4 h-4 text-[#1A1A1A]" fill="currentColor" strokeWidth={0} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#A0A0A0] mb-3">
              <Gamepad2 className="w-4 h-4" />
              <span className="text-sm">Online · Playing Overwatch</span>
            </div>
            <p className="text-[#A0A0A0] text-sm mb-5 leading-relaxed">
              Competitive gamer · Tournament organizer · Always looking for new challenges
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('edit-profile')}
              className="w-full bg-[#FF9F66] text-[#1A1A1A] py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </motion.button>
          </motion.div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Stats Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4">Stats</h2>
          <div className="grid grid-cols-4 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#242424] rounded-2xl p-4 text-center border border-[#333]"
                >
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="text-xl font-bold mb-0.5">{stat.value}</div>
                  <div className="text-xs text-[#A0A0A0]">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => {
              const AchIcon = achievement.Icon;
              return (
                <motion.div
                  key={achievement.name}
                  initial={{ rotate: -5, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ scale: 1.04 }}
                  className="bg-[#242424] rounded-2xl p-4 text-center border-2"
                  style={{ borderColor: achievement.color + '40' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: achievement.color + '20' }}
                  >
                    <AchIcon size={28} weight="fill" color={achievement.color} />
                  </div>
                  <div className="text-sm font-bold mb-1">{achievement.name}</div>
                  <div className="text-xs capitalize" style={{ color: achievement.color }}>
                    {achievement.rarity}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Games */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">My Games</h2>
            <span className="text-sm text-[#A0A0A0]">{games.length} games</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {games.map((game, index) => (
              <motion.div
                key={game.name}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              >
                <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-xs font-bold truncate">{game.name}</div>
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