import { motion } from 'motion/react';
import { ArrowLeft, Bell, MessageSquare, Users, Trophy, Volume2, Vibrate, Moon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface NotificationSettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function NotificationSettingsScreen({ onBack, onNavigate }: NotificationSettingsScreenProps) {
  /**
   * Flat map of all notification toggle states.
   * Keys correspond to notification categories; values are boolean on/off.
   */
  const [settings, setSettings] = useState({
    // Push Notifications
    pushEnabled: true,
    // Messages
    messages: true,
    messageSound: true,
    // Groups
    groupInvites: true,
    groupEvents: true,
    // Social
    friendRequests: true,
    friendOnline: false,
    // Gaming
    tournamentReminders: true,
    matchStarting: true,
    // System
    emailNotifications: true,
    vibration: true
  });

  /**
   * Generic toggle handler — flips any boolean key in the settings object.
   * Shows a 1-second "Settings updated" toast on every change.
   * @param key - A keyof the settings object to toggle
   */
  const handleToggle = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
    toast.success('Settings updated', { duration: 1000 });
  };

  /**
   * Reusable animated toggle switch sub-component.
   * Green (#66FF9F) when enabled, dark grey (#3A3A3A) when disabled.
   * The knob animates with Motion's `animate` to slide left/right.
   */
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
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Master Toggle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#FF9F66]/20 to-[#FF7733]/20 border border-[#FF9F66]/30 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-[#FF9F66]" />
            <div className="flex-1">
              <div className="font-bold">Push Notifications</div>
              <div className="text-xs text-[#A0A0A0]">Master control for all notifications</div>
            </div>
            <ToggleSwitch enabled={settings.pushEnabled} onToggle={() => handleToggle('pushEnabled')} />
          </div>
        </motion.div>

        {/* Messages */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
          </h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-[#3A3A3A]">
              <div className="flex-1">
                <div className="font-medium">Direct Messages</div>
                <div className="text-xs text-[#A0A0A0]">Notify when you receive a message</div>
              </div>
              <ToggleSwitch enabled={settings.messages} onToggle={() => handleToggle('messages')} />
            </div>
            <div className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-medium">Message Sounds</div>
                <div className="text-xs text-[#A0A0A0]">Play sound for new messages</div>
              </div>
              <ToggleSwitch enabled={settings.messageSound} onToggle={() => handleToggle('messageSound')} />
            </div>
          </div>
        </motion.div>

        {/* Groups */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase flex items-center gap-2">
            <Users className="w-4 h-4" />
            Groups
          </h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-[#3A3A3A]">
              <div className="flex-1">
                <div className="font-medium">Group Invites</div>
                <div className="text-xs text-[#A0A0A0]">When someone invites you to a group</div>
              </div>
              <ToggleSwitch enabled={settings.groupInvites} onToggle={() => handleToggle('groupInvites')} />
            </div>
            <div className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-medium">Group Events</div>
                <div className="text-xs text-[#A0A0A0]">Upcoming events from your groups</div>
              </div>
              <ToggleSwitch enabled={settings.groupEvents} onToggle={() => handleToggle('groupEvents')} />
            </div>
          </div>
        </motion.div>

        {/* Social */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase flex items-center gap-2">
            <Users className="w-4 h-4" />
            Social
          </h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-[#3A3A3A]">
              <div className="flex-1">
                <div className="font-medium">Friend Requests</div>
                <div className="text-xs text-[#A0A0A0]">New friend request notifications</div>
              </div>
              <ToggleSwitch enabled={settings.friendRequests} onToggle={() => handleToggle('friendRequests')} />
            </div>
            <div className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-medium">Friend Online</div>
                <div className="text-xs text-[#A0A0A0]">When friends come online</div>
              </div>
              <ToggleSwitch enabled={settings.friendOnline} onToggle={() => handleToggle('friendOnline')} />
            </div>
          </div>
        </motion.div>

        {/* Gaming */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Gaming
          </h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-[#3A3A3A]">
              <div className="flex-1">
                <div className="font-medium">Tournament Reminders</div>
                <div className="text-xs text-[#A0A0A0]">Remind me before tournaments start</div>
              </div>
              <ToggleSwitch enabled={settings.tournamentReminders} onToggle={() => handleToggle('tournamentReminders')} />
            </div>
            <div className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-medium">Match Starting</div>
                <div className="text-xs text-[#A0A0A0]">When your match is about to begin</div>
              </div>
              <ToggleSwitch enabled={settings.matchStarting} onToggle={() => handleToggle('matchStarting')} />
            </div>
          </div>
        </motion.div>

        {/* System */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">System</h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-[#3A3A3A]">
              <Volume2 className="w-5 h-5 text-[#66BAFF]" />
              <div className="flex-1">
                <div className="font-medium">Email Notifications</div>
                <div className="text-xs text-[#A0A0A0]">Receive updates via email</div>
              </div>
              <ToggleSwitch enabled={settings.emailNotifications} onToggle={() => handleToggle('emailNotifications')} />
            </div>
            <div className="p-4 flex items-center gap-3">
              <Vibrate className="w-5 h-5 text-[#FF9F66]" />
              <div className="flex-1">
                <div className="font-medium">Vibration</div>
                <div className="text-xs text-[#A0A0A0]">Vibrate on notifications</div>
              </div>
              <ToggleSwitch enabled={settings.vibration} onToggle={() => handleToggle('vibration')} />
            </div>
          </div>
        </motion.div>

        {/* Quiet Hours */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">Quiet Hours</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#2A2A2A] p-4 rounded-2xl flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-[#FF9F66]/20 flex items-center justify-center">
              <Moon className="w-6 h-6 text-[#FF9F66]" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Set Quiet Hours</div>
              <div className="text-xs text-[#A0A0A0]">Mute notifications during specific times</div>
            </div>
            <div className="text-sm text-[#A0A0A0]">Not set</div>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}