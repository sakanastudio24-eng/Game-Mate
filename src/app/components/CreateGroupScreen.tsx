import { motion } from 'motion/react';
import { ArrowLeft, Upload, Globe, Lock, Users } from 'lucide-react';
import { useState } from 'react';

interface CreateGroupScreenProps {
  onBack: () => void;
  onCreate: () => void;
}

export function CreateGroupScreen({ onBack, onCreate }: CreateGroupScreenProps) {
  /** Group display name */
  const [groupName, setGroupName] = useState('');
  /** Selected game tag (single selection) */
  const [game, setGame] = useState('');
  /** Group description body text */
  const [description, setDescription] = useState('');
  /** Privacy setting — controls who can join */
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  /** Selected category chip */
  const [category, setCategory] = useState('');

  /** Category chips shown as a horizontal scrollable row */
  const categories = [
    'Tournament', 'Squad', 'Casual', 'Competitive', 'Community', 'Event'
  ];

  /** Game chips shown in a 2-column grid */
  const games = [
    'Overwatch', 'Valorant', 'CS2', 'League of Legends', 'Fortnite', 'Apex Legends'
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-[#1A1A1A] text-[#F5F5F5] z-50 overflow-y-auto pb-24"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-12 h-12 bg-[#2A2A2A] rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-2xl font-bold">Create Group</h1>
          <div className="w-12" />
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Group Image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#2A2A2A] rounded-3xl aspect-video flex flex-col items-center justify-center border-2 border-dashed border-[#3A3A3A] cursor-pointer hover:border-[#FF9F66] transition-colors"
          >
            <Upload className="w-12 h-12 text-[#A0A0A0] mb-2" />
            <p className="text-[#A0A0A0]">Upload Group Image</p>
          </motion.div>

          {/* Group Name */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-bold mb-2 text-[#A0A0A0]">GROUP NAME</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full bg-[#2A2A2A] rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#FF9F66]"
            />
          </motion.div>

          {/* Game Selection */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-bold mb-2 text-[#A0A0A0]">GAME</label>
            <div className="grid grid-cols-2 gap-3">
              {games.map((g) => (
                <motion.button
                  key={g}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setGame(g)}
                  className={`py-3 px-4 rounded-2xl font-bold transition-colors ${
                    game === g
                      ? 'bg-[#FF9F66] text-[#1A1A1A]'
                      : 'bg-[#2A2A2A] text-[#F5F5F5]'
                  }`}
                >
                  {g}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Category */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-bold mb-2 text-[#A0A0A0]">CATEGORY</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${
                    category === cat
                      ? 'bg-[#FF9F66] text-[#1A1A1A]'
                      : 'bg-[#2A2A2A] text-[#F5F5F5]'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-bold mb-2 text-[#A0A0A0]">DESCRIPTION</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others about your group..."
              rows={4}
              className="w-full bg-[#2A2A2A] rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#FF9F66] resize-none"
            />
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-bold mb-3 text-[#A0A0A0]">PRIVACY</label>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPrivacy('public')}
                className={`p-6 rounded-2xl transition-colors ${
                  privacy === 'public'
                    ? 'bg-[#FF9F66] text-[#1A1A1A]'
                    : 'bg-[#2A2A2A] text-[#F5F5F5]'
                }`}
              >
                <Globe className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold mb-1">Public</div>
                <div className="text-xs opacity-80">Anyone can join</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPrivacy('private')}
                className={`p-6 rounded-2xl transition-colors ${
                  privacy === 'private'
                    ? 'bg-[#FF9F66] text-[#1A1A1A]'
                    : 'bg-[#2A2A2A] text-[#F5F5F5]'
                }`}
              >
                <Lock className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold mb-1">Private</div>
                <div className="text-xs opacity-80">Invite only</div>
              </motion.button>
            </div>
          </motion.div>

          {/* Create Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreate}
            className="w-full bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A] py-4 rounded-2xl font-bold text-lg"
          >
            Create Group
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}