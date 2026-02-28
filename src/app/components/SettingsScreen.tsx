import { motion } from 'motion/react';
import { ArrowLeft, User, Bell, Lock, Palette, Globe, HelpCircle, LogOut, ChevronRight, CheckCircle } from 'lucide-react';

const SELF_AVATAR = 'https://images.unsplash.com/photo-1579975979101-7a3c3909d659?w=200&h=200&fit=crop';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function SettingsScreen({ onBack, onNavigate }: SettingsScreenProps) {
  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', action: 'edit-profile' },
        { icon: User, label: 'Account Settings', action: 'account-settings' },
        { icon: Lock, label: 'Privacy & Security', action: 'privacy-settings' },
        { icon: Bell, label: 'Notifications', action: 'notification-settings' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Palette, label: 'Appearance', action: 'appearance-settings' },
        { icon: Globe, label: 'Language', action: 'language-settings' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', action: 'help-support' },
        { icon: LogOut, label: 'Log Out', action: 'logout', danger: true },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-[#1A1A1A] text-[#F5F5F5] z-50 overflow-y-auto"
    >
      <div className="p-6 pb-16">
        {/* Header */}
        <div className="flex items-center mb-8 pt-2">
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-11 h-11 bg-[#242424] border border-[#333] rounded-full flex items-center justify-center mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#242424] border border-[#333] rounded-3xl p-5 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-[68px] h-[68px] rounded-full p-[2px] bg-gradient-to-br from-[#FF9F66] to-[#FF7733]">
                <img
                  src={SELF_AVATAR}
                  alt="PlayerMaker34"
                  className="w-full h-full rounded-full object-cover border-2 border-[#242424]"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4ADE80] rounded-full border-2 border-[#242424]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h2 className="text-xl font-bold truncate">PlayerMaker34</h2>
                <CheckCircle className="w-4 h-4 text-[#FF9F66] flex-shrink-0" fill="currentColor" strokeWidth={0} />
              </div>
              <p className="text-sm text-[#A0A0A0] truncate">playmaker@gamemate.com</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#606060] flex-shrink-0" />
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-7">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: sectionIndex * 0.08 }}
            >
              <h3 className="text-xs font-bold text-[#606060] mb-3 uppercase tracking-widest pl-1">
                {section.title}
              </h3>
              <div className="bg-[#242424] border border-[#333] rounded-2xl overflow-hidden">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      whileHover={{ backgroundColor: '#2e2e2e' }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => item.action === 'logout' ? onBack() : onNavigate(item.action)}
                      className={`w-full p-4 flex items-center gap-4 transition-colors ${
                        itemIndex !== section.items.length - 1 ? 'border-b border-[#333]' : ''
                      } ${item.danger ? 'text-[#FF6B6B]' : ''}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.danger ? 'bg-[#FF6B6B]/10' : 'bg-[#333]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-[#606060]" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-[#606060] text-xs"
        >
          Game Mate v1.0.0
        </motion.div>
      </div>
    </motion.div>
  );
}
