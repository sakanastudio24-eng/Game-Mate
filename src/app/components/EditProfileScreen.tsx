import { motion } from 'motion/react';
import { ArrowLeft, Camera, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface EditProfileScreenProps {
  onBack: () => void;
}

export function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  /**
   * All editable profile fields in a single controlled object.
   * Pre-populated with mock current-user data.
   */
  const [formData, setFormData] = useState({
    username: 'PlayerMaker34',
    bio: 'Competitive gamer · Tournament organizer · Always looking for new challenges',
    email: 'playermaker@gamemate.com',
    favoriteGame: 'Overwatch',
    region: 'North America',
    playStyle: 'Competitive'
  });

  const games = ['Overwatch', 'Valorant', 'CS2', 'Apex Legends', 'League of Legends', 'Fortnite'];
  const regions = ['North America', 'Europe', 'Asia', 'South America', 'Oceania'];
  const playStyles = ['Competitive', 'Casual', 'Both'];

  /**
   * Saves the profile, shows a success toast, and navigates back after 500ms.
   * In production: await an API/Supabase update call before calling onBack.
   */
  const handleSave = () => {
    toast.success('Profile updated successfully!', {
      duration: 2000
    });
    setTimeout(() => {
      onBack();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5]"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#1A1A1A]/95 backdrop-blur-lg z-10 border-b border-[#2A2A2A]">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-12 h-12 bg-[#2A2A2A] rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="bg-[#FF9F66] text-[#1A1A1A] px-6 py-3 rounded-full font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </motion.button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Photo */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-br from-[#FF9F66] to-[#FF7733]">
              <img
                src="https://images.unsplash.com/photo-1579975979101-7a3c3909d659?w=200&h=200&fit=crop"
                alt="PlayerMaker34"
                className="w-full h-full rounded-full object-cover border-4 border-[#1A1A1A]"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-0 right-0 w-10 h-10 bg-[#FF9F66] rounded-full flex items-center justify-center border-4 border-[#1A1A1A]"
            >
              <Camera className="w-4 h-4 text-[#1A1A1A]" />
            </motion.button>
          </div>
          <p className="text-sm text-[#A0A0A0] mt-3">Tap to change photo</p>
        </motion.div>

        {/* Form Fields */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Username */}
          <div>
            <label className="block text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-[#2A2A2A] rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF9F66]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-bold mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full bg-[#2A2A2A] rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF9F66] resize-none"
            />
            <p className="text-xs text-[#A0A0A0] mt-2">{formData.bio.length}/150 characters</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#2A2A2A] rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF9F66]"
            />
          </div>

          {/* Favorite Game */}
          <div>
            <label className="block text-sm font-bold mb-2">Favorite Game</label>
            <select
              value={formData.favoriteGame}
              onChange={(e) => setFormData({ ...formData, favoriteGame: e.target.value })}
              className="w-full bg-[#2A2A2A] rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF9F66]"
            >
              {games.map((game) => (
                <option key={game} value={game}>{game}</option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-bold mb-2">Region</label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full bg-[#2A2A2A] rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF9F66]"
            >
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Play Style */}
          <div>
            <label className="block text-sm font-bold mb-2">Play Style</label>
            <div className="grid grid-cols-3 gap-3">
              {playStyles.map((style) => (
                <motion.button
                  key={style}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, playStyle: style })}
                  className={`py-3 rounded-2xl font-bold transition-all ${
                    formData.playStyle === style
                      ? 'bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A]'
                      : 'bg-[#2A2A2A] text-[#A0A0A0]'
                  }`}
                >
                  {style}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="pt-6 border-t border-[#2A2A2A]">
            <h2 className="text-xl font-bold mb-4">Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#2A2A2A] rounded-2xl">
                <div>
                  <div className="font-bold">Public Profile</div>
                  <div className="text-sm text-[#A0A0A0]">Anyone can see your profile</div>
                </div>
                <input type="checkbox" defaultChecked className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#2A2A2A] rounded-2xl">
                <div>
                  <div className="font-bold">Show Online Status</div>
                  <div className="text-sm text-[#A0A0A0]">Let friends see when you're online</div>
                </div>
                <input type="checkbox" defaultChecked className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#2A2A2A] rounded-2xl">
                <div>
                  <div className="font-bold">Allow Friend Requests</div>
                  <div className="text-sm text-[#A0A0A0]">Accept friend requests from anyone</div>
                </div>
                <input type="checkbox" defaultChecked className="w-6 h-6" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delete Account */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#FF6B6B]/10 text-[#FF6B6B] py-4 rounded-2xl font-bold"
        >
          Delete Account
        </motion.button>
      </div>
    </motion.div>
  );
}