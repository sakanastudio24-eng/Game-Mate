import { motion } from 'motion/react';
import { QrCode, Heart, MessageCircle, Bookmark, Play, Share2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface NewsScreenProps {
  onNavigate: (screen: string) => void;
}

const AUTHOR_AVATARS: Record<string, string> = {
  ProGamingLeague: 'https://images.unsplash.com/photo-1759701546655-d90ec831aa52?w=100&h=100&fit=crop',
  GameStrategy: 'https://images.unsplash.com/photo-1622349851524-890cc3641b87?w=100&h=100&fit=crop',
  GameDevs: 'https://images.unsplash.com/photo-1613063022614-dc11527f5ece?w=100&h=100&fit=crop',
};

export function NewsScreen({ onNavigate }: NewsScreenProps) {
  const [activeCategory, setActiveCategory] = useState('fyp');
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);

  const categories = [
    { id: 'fyp', label: 'For You' },
    { id: 'esports', label: 'Esports' },
    { id: 'patches', label: 'Updates' },
    { id: 'streams', label: 'Streams' },
  ];

  const newsItems = [
    {
      id: 1,
      type: 'video',
      title: 'Disco 2024 Tournament Finals',
      author: 'ProGamingLeague',
      date: 'Aug 25, 2026',
      duration: '1:20',
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
      likes: 1240,
      comments: 89,
      category: 'fyp',
    },
    {
      id: 2,
      type: 'video',
      title: 'New Meta Breakdown — Season 5',
      author: 'GameStrategy',
      date: 'Feb 12, 2026',
      duration: '58s',
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80',
      likes: 856,
      comments: 45,
      category: 'fyp',
    },
    {
      id: 3,
      type: 'article',
      title: 'Patch Notes 3.2 — Major Balance Changes',
      author: 'GameDevs',
      date: 'Feb 10, 2026',
      thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80',
      likes: 2100,
      comments: 156,
      category: 'patches',
    },
  ];

  const toggleLike = (id: number) =>
    setLikedPosts((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const toggleSave = (id: number) =>
    setSavedPosts((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

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
              News
            </motion.h1>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('qr')}
              className="w-11 h-11 bg-[#242424] border border-[#333] rounded-full flex items-center justify-center"
            >
              <QrCode className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#FF9F66] text-[#1A1A1A]'
                    : 'bg-[#242424] text-[#A0A0A0] border border-[#333]'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="p-6 space-y-6">
        {newsItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#242424] border border-[#333] rounded-3xl overflow-hidden"
          >
            {/* Post Header */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-[#444] flex-shrink-0">
                <img
                  src={AUTHOR_AVATARS[item.author]}
                  alt={item.author}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{item.author}</h3>
                <p className="text-xs text-[#606060]">{item.date}</p>
              </div>
              <button className="text-[#606060] p-1">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Media */}
            <div className="relative aspect-video bg-[#1A1A1A]">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent" />

              {item.type === 'video' && (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#FF9F66]/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                      <Play className="w-7 h-7 text-[#1A1A1A] ml-0.5" fill="currentColor" />
                    </div>
                  </motion.div>
                  <div className="absolute top-3 right-3 bg-[#1A1A1A]/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Play className="w-3 h-3" fill="currentColor" />
                    <span className="text-xs font-medium">{item.duration}</span>
                  </div>
                </>
              )}

              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-lg font-bold leading-snug">{item.title}</h2>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleLike(item.id)}
                  className="flex items-center gap-1.5"
                >
                  <motion.div animate={likedPosts.includes(item.id) ? { scale: [1, 1.3, 1] } : {}}>
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        likedPosts.includes(item.id) ? 'fill-[#FF6B6B] text-[#FF6B6B]' : 'text-[#A0A0A0]'
                      }`}
                    />
                  </motion.div>
                  <span className="text-sm text-[#A0A0A0]">
                    {item.likes + (likedPosts.includes(item.id) ? 1 : 0)}
                  </span>
                </motion.button>

                <motion.button whileTap={{ scale: 0.85 }} className="flex items-center gap-1.5">
                  <MessageCircle className="w-5 h-5 text-[#A0A0A0]" />
                  <span className="text-sm text-[#A0A0A0]">{item.comments}</span>
                </motion.button>

                <motion.button whileTap={{ scale: 0.85 }}>
                  <Share2 className="w-5 h-5 text-[#A0A0A0]" />
                </motion.button>
              </div>

              <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleSave(item.id)}>
                <Bookmark
                  className={`w-5 h-5 transition-colors ${
                    savedPosts.includes(item.id) ? 'fill-[#FF9F66] text-[#FF9F66]' : 'text-[#A0A0A0]'
                  }`}
                />
              </motion.button>
            </div>
          </motion.div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full bg-[#242424] border border-[#333] text-[#A0A0A0] py-4 rounded-2xl font-bold"
        >
          Load More
        </motion.button>
      </div>
    </motion.div>
  );
}
