import { motion } from 'motion/react';
import { QrCode, Plus, Search, CheckCircle } from 'lucide-react';
import { Users } from '@phosphor-icons/react';

interface GroupsScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

const MEMBER_AVATARS = [
  'https://images.unsplash.com/photo-1613063022614-dc11527f5ece?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1757773873686-2257941bbcb8?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1628501899963-43bb8e2423e1?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1622349851524-890cc3641b87?w=80&h=80&fit=crop',
];

export function GroupsScreen({ onNavigate }: GroupsScreenProps) {
  const myGroups = [
    {
      id: 1,
      name: 'Disco 2024 Tournament',
      game: 'Overwatch',
      date: 'Aug 25, 2025',
      members: 12,
      online: 8,
      thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80',
      category: 'tournament',
      isVerified: true,
    },
    {
      id: 2,
      name: 'Arc Raiders Squad',
      game: 'Arc Raiders',
      members: 8,
      online: 3,
      thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80',
      category: 'squad',
      isVerified: false,
    },
    {
      id: 3,
      name: 'Valorant Grinders',
      game: 'Valorant',
      members: 24,
      online: 15,
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
      category: 'community',
      isVerified: true,
    },
  ];

  const suggestedGroups = [
    {
      id: 4,
      name: 'CS2 Pro League',
      game: 'Counter-Strike 2',
      members: 156,
      online: 89,
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80',
      category: 'competitive',
    },
    {
      id: 5,
      name: 'Chill Gaming Nights',
      game: 'Various',
      members: 45,
      online: 12,
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
      category: 'casual',
    },
  ];

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
          <div className="flex items-center justify-between mb-4">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-4xl font-bold"
            >
              Groups
            </motion.h1>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('discover-groups')}
                className="w-11 h-11 bg-[#242424] border border-[#333] rounded-full flex items-center justify-center"
              >
                <Search className="w-5 h-5 text-[#F5F5F5]" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('qr')}
                className="w-11 h-11 bg-[#242424] border border-[#333] rounded-full flex items-center justify-center"
              >
                <QrCode className="w-5 h-5 text-[#F5F5F5]" />
              </motion.button>
            </div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3"
          >
            <div className="bg-[#FF9F66] text-[#1A1A1A] px-5 py-2 rounded-full text-sm font-bold">
              {myGroups.length} Active Groups
            </div>
            <div className="bg-[#242424] border border-[#333] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] inline-block" />
              <span className="text-[#4ADE80]">{myGroups.reduce((a, g) => a + g.online, 0)} Online</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* My Groups */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">My Groups</h2>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('create-group')}
              className="bg-[#FF9F66] text-[#1A1A1A] px-4 py-2 rounded-full font-bold flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              Create
            </motion.button>
          </div>

          <div className="space-y-4">
            {myGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onNavigate('group-detail', group)}
                className="relative rounded-3xl overflow-hidden bg-[#242424] border border-[#333] cursor-pointer"
              >
                <div className="relative h-44">
                  <img
                    src={group.thumbnail}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent" />

                  {/* Verified */}
                  {group.isVerified && (
                    <div className="absolute top-4 right-4 bg-[#FF9F66] rounded-full p-1.5">
                      <CheckCircle className="w-4 h-4 text-[#1A1A1A]" fill="currentColor" strokeWidth={0} />
                    </div>
                  )}

                  {/* Online pill */}
                  <div className="absolute top-4 left-4 bg-[#1A1A1A]/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 bg-[#4ADE80] rounded-full"
                    />
                    <span className="text-xs font-medium">{group.online} online</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold mb-0.5">{group.name}</h3>
                      <p className="text-sm text-[#A0A0A0]">{group.game}</p>
                    </div>
                    {group.date && (
                      <span className="text-xs text-[#FF9F66] bg-[#FF9F66]/10 border border-[#FF9F66]/20 px-3 py-1 rounded-full flex-shrink-0">
                        {group.date}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Member avatar stack */}
                    <div className="flex -space-x-2">
                      {MEMBER_AVATARS.slice(0, Math.min(4, group.members)).map((avatar, i) => (
                        <motion.img
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          src={avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border-2 border-[#242424]"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-[#A0A0A0]">
                      {group.members} members
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Suggested */}
        <div>
          <h2 className="text-xl font-bold mb-4">Suggested For You</h2>
          <div className="space-y-3">
            {suggestedGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="bg-[#242424] border border-[#333] rounded-2xl p-4 flex gap-4 cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={group.thumbnail} alt={group.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold mb-0.5 truncate">{group.name}</h3>
                  <p className="text-sm text-[#A0A0A0] mb-2">{group.game}</p>
                  <div className="flex items-center gap-2 text-xs text-[#A0A0A0]">
                    <Users size={14} />
                    <span>{group.members} members</span>
                    <span>·</span>
                    <span className="text-[#4ADE80]">{group.online} online</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="bg-[#FF9F66] text-[#1A1A1A] px-4 py-2 rounded-full font-bold h-fit flex-shrink-0 self-center text-sm"
                >
                  Join
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
