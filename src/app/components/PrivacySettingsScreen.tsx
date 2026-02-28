import { motion } from 'motion/react';
import { ArrowLeft, Eye, UserX, Lock, Globe, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PrivacySettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function PrivacySettingsScreen({ onBack, onNavigate }: PrivacySettingsScreenProps) {
  const [settings, setSettings] = useState({
    publicProfile: true,
    showOnlineStatus: true,
    showActivity: true,
    allowFriendRequests: true,
    showGroups: true,
    showAchievements: true,
    showStats: true
  });

  const handleToggle = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
    toast.success('Privacy settings updated', { duration: 1000 });
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className={`relative w-14 h-8 rounded-full transition-colors ${
        enabled ? 'bg-[#66FF9F]' : 'bg-[#3A3A3A]'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 2 }}
        className="absolute top-1 w-6 h-6 bg-[#F5F5F5] rounded-full"
      />
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5]"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#1A1A1A]/95 backdrop-blur-lg z-10 border-b border-[#2A2A2A]">
        <div className="p-6 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-12 h-12 bg-[#2A2A2A] rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-2xl font-bold">Privacy & Security</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Visibility */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Profile Visibility
          </h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-[#3A3A3A]">
              <div className="flex-1">
                <div className="font-medium">Public Profile</div>
                <div className="text-xs text-[#A0A0A0]">Anyone can see your profile</div>
              </div>
              <ToggleSwitch enabled={settings.publicProfile} onToggle={() => handleToggle('publicProfile')} />
            </div>
            <div className="p-4 flex items-center gap-3 border-b border-[#3A3A3A]">
              <div className="flex-1">
                <div className="font-medium">Show Online Status</div>
                <div className="text-xs text-[#A0A0A0]">Let others see when you're active</div>
              </div>
              <ToggleSwitch enabled={settings.showOnlineStatus} onToggle={() => handleToggle('showOnlineStatus')} />
            </div>
            <div className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-medium">Show Activity</div>
                <div className="text-xs text-[#A0A0A0]">Display what game you're playing</div>
              </div>
              <ToggleSwitch enabled={settings.showActivity} onToggle={() => handleToggle('showActivity')} />
            </div>
          </div>
        </motion.div>

        {/* Who Can */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Who Can...
          </h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-[#3A3A3A]">
              <div className="flex-1">
                <div className="font-medium">Send Friend Requests</div>
                <div className="text-xs text-[#A0A0A0]">Control who can add you</div>
              </div>
              <ToggleSwitch enabled={settings.allowFriendRequests} onToggle={() => handleToggle('allowFriendRequests')} />
            </div>
            <div className="p-4 flex items-center gap-3 border-b border-[#3A3A3A]">
              <div className="flex-1">
                <div className="font-medium">See Your Groups</div>
                <div className="text-xs text-[#A0A0A0]">Display groups on your profile</div>
              </div>
              <ToggleSwitch enabled={settings.showGroups} onToggle={() => handleToggle('showGroups')} />
            </div>
            <div className="p-4 flex items-center gap-3 border-b border-[#3A3A3A]">
              <div className="flex-1">
                <div className="font-medium">See Your Achievements</div>
                <div className="text-xs text-[#A0A0A0]">Show achievements to others</div>
              </div>
              <ToggleSwitch enabled={settings.showAchievements} onToggle={() => handleToggle('showAchievements')} />
            </div>
            <div className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-medium">See Your Stats</div>
                <div className="text-xs text-[#A0A0A0]">Display gaming statistics</div>
              </div>
              <ToggleSwitch enabled={settings.showStats} onToggle={() => handleToggle('showStats')} />
            </div>
          </div>
        </motion.div>

        {/* Blocked Users */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase flex items-center gap-2">
            <UserX className="w-4 h-4" />
            Blocked Users
          </h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('blocked-users')}
            className="w-full bg-[#2A2A2A] p-4 rounded-2xl flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-[#FF6B6B]/20 flex items-center justify-center">
              <UserX className="w-6 h-6 text-[#FF6B6B]" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Blocked Users</div>
              <div className="text-xs text-[#A0A0A0]">Manage blocked users list</div>
            </div>
            <div className="text-sm text-[#A0A0A0]">0 blocked</div>
          </motion.button>
        </motion.div>

        {/* Data Collection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Data & Analytics
          </h2>
          <div className="bg-[#2A2A2A] rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#66BAFF] mt-1" />
              <div className="flex-1">
                <div className="font-medium mb-2">Usage Analytics</div>
                <div className="text-xs text-[#A0A0A0] mb-3">
                  Help us improve Game Mate by sharing anonymous usage data
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#A0A0A0]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#66FF9F]" />
                    App performance metrics
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#A0A0A0]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#66FF9F]" />
                    Feature usage statistics
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#A0A0A0]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#66FF9F]" />
                    Crash reports
                  </div>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#3A3A3A] py-3 rounded-xl font-bold"
            >
              Manage Data Settings
            </motion.button>
          </div>
        </motion.div>

        {/* Legal */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Legal
          </h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            <motion.button
              whileHover={{ backgroundColor: '#3A3A3A' }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 flex items-center justify-between border-b border-[#3A3A3A]"
            >
              <span className="font-medium">Privacy Policy</span>
              <span className="text-xs text-[#A0A0A0]">Updated Feb 2026</span>
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: '#3A3A3A' }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 flex items-center justify-between"
            >
              <span className="font-medium">Terms of Service</span>
              <span className="text-xs text-[#A0A0A0]">Updated Jan 2026</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
