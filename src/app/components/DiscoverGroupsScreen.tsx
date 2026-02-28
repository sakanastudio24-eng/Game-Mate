import { motion } from 'motion/react';
import { ArrowLeft, Search, Filter, TrendingUp, Users, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DiscoverGroupsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

export function DiscoverGroupsScreen({ onBack, onNavigate }: DiscoverGroupsScreenProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'competitive', label: 'Competitive', icon: Gamepad2 }
  ];

  const groups = [
    {
      id: 1,
      name: 'Pro Overwatch League',
      game: 'Overwatch',
      members: 2340,
      online: 1234,
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80',
      category: 'competitive',
      description: 'Join the best competitive Overwatch players',
      verified: true,
      trending: true
    },
    {
      id: 2,
      name: 'Valorant Champions',
      game: 'Valorant',
      members: 1890,
      online: 890,
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
      category: 'competitive',
      description: 'Elite Valorant community for ranked grinding',
      verified: true,
      trending: true
    },
    {
      id: 3,
      name: 'CS2 Pro League',
      game: 'Counter-Strike 2',
      members: 3456,
      online: 1567,
      thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80',
      category: 'competitive',
      description: 'Premier CS2 competitive community',
      verified: true,
      trending: false
    },
    {
      id: 4,
      name: 'Chill Gaming Nights',
      game: 'Various',
      members: 567,
      online: 123,
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
      category: 'casual',
      description: 'Relaxed gaming sessions with friends',
      verified: false,
      trending: false
    },
    {
      id: 5,
      name: 'Apex Legends Masters',
      game: 'Apex Legends',
      members: 1234,
      online: 456,
      thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80',
      category: 'competitive',
      description: 'Climb to Apex Predator together',
      verified: true,
      trending: true
    },
    {
      id: 6,
      name: 'League of Legends EUW',
      game: 'League of Legends',
      members: 4567,
      online: 2234,
      thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
      category: 'competitive',
      description: 'European League community',
      verified: true,
      trending: false
    }
  ];

  const handleJoinGroup = (group: any) => {
    toast.success(`Joined ${group.name}!`, {
      description: 'You can now access group features',
      duration: 2000
    });
  };

  const filteredGroups = groups.filter((group) => {
    const matchesCategory = activeCategory === 'all' || 
      (activeCategory === 'trending' && group.trending) ||
      group.category === activeCategory;
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.game.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5] pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#1A1A1A]/95 backdrop-blur-lg z-10 border-b border-[#2A2A2A]">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-12 h-12 bg-[#2A2A2A] rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-3xl font-bold">Discover Groups</h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Search groups or games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2A2A2A] rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-[#FF9F66]"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <Filter className="w-5 h-5 text-[#A0A0A0]" />
            </motion.button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A]'
                      : 'bg-[#2A2A2A] text-[#A0A0A0]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {category.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {filteredGroups.length} Groups Found
          </h2>
        </div>

        {filteredGroups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#2A2A2A] rounded-3xl overflow-hidden"
          >
            <div className="relative h-48">
              <img 
                src={group.thumbnail} 
                alt={group.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/50 to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                <div className="flex gap-2">
                  {group.trending && (
                    <div className="bg-[#FF9F66] px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-[#1A1A1A]">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </div>
                  )}
                  <div className="bg-[#1A1A1A]/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 bg-[#66FF9F] rounded-full"
                    />
                    <span className="text-xs">{group.online} online</span>
                  </div>
                </div>
                {group.verified && (
                  <div className="bg-[#FF9F66] rounded-full p-2">
                    <svg className="w-4 h-4 text-[#1A1A1A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="mb-3">
                <h3 className="text-xl font-bold mb-1">{group.name}</h3>
                <p className="text-sm text-[#A0A0A0] mb-2">{group.game}</p>
                <p className="text-sm text-[#A0A0A0]">{group.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(4, Math.floor(group.members / 500)))].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9F66] to-[#FF7733] border-2 border-[#2A2A2A]"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[#A0A0A0]">
                    {group.members.toLocaleString()} members
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleJoinGroup(group)}
                  className="bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A] px-6 py-3 rounded-full font-bold"
                >
                  Join Group
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredGroups.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-[#2A2A2A] mx-auto mb-4 flex items-center justify-center">
              <Search className="w-10 h-10 text-[#A0A0A0]" />
            </div>
            <h3 className="text-xl font-bold mb-2">No groups found</h3>
            <p className="text-[#A0A0A0]">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}