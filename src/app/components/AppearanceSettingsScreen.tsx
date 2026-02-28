import { motion } from 'motion/react';
import { ArrowLeft, Palette, Moon, Sun, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AppearanceSettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function AppearanceSettingsScreen({ onBack, onNavigate }: AppearanceSettingsScreenProps) {
  /** Currently selected theme mode */
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  /** Currently selected accent colour hex value */
  const [accentColor, setAccentColor] = useState('#FF9F66');

  /** Theme option cards — icon, label, and description */
  const themes = [
    { id: 'dark' as const, label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { id: 'light' as const, label: 'Light', icon: Sun, description: 'Bright and clear' },
    { id: 'auto' as const, label: 'Auto', icon: Smartphone, description: 'Match system' }
  ];

  /** Accent colour swatches — each has a name, solid colour, and gradient string */
  const accentColors = [
    { name: 'Orange', color: '#FF9F66', gradient: 'from-[#FF9F66] to-[#FF7733]' },
    { name: 'Blue', color: '#66BAFF', gradient: 'from-[#66BAFF] to-[#3498DB]' },
    { name: 'Green', color: '#66FF9F', gradient: 'from-[#66FF9F] to-[#2ECC71]' },
    { name: 'Purple', color: '#9B59B6', gradient: 'from-[#9B59B6] to-[#8E44AD]' },
    { name: 'Pink', color: '#FF66BA', gradient: 'from-[#FF66BA] to-[#E91E63]' },
    { name: 'Red', color: '#FF6B6B', gradient: 'from-[#FF6B6B] to-[#E74C3C]' }
  ];

  /**
   * Updates the active theme and shows a success toast.
   * @param newTheme - The selected theme mode
   */
  const handleThemeChange = (newTheme: 'dark' | 'light' | 'auto') => {
    setTheme(newTheme);
    toast.success(`Theme set to ${newTheme}`, { duration: 1500 });
  };

  /**
   * Updates the accent colour and shows a 1.5-second success toast.
   * @param color - The selected hex colour value
   */
  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    toast.success('Accent color updated!', { duration: 1500 });
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
        <div className="p-6 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-12 h-12 bg-[#2A2A2A] rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-2xl font-bold">Appearance</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Theme Selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {themes.map((t, index) => {
              const Icon = t.icon;
              return (
                <motion.button
                  key={t.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeChange(t.id)}
                  className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${
                    theme === t.id
                      ? 'bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A]'
                      : 'bg-[#2A2A2A] text-[#F5F5F5]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    theme === t.id ? 'bg-[#1A1A1A]/20' : 'bg-[#3A3A3A]'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">{t.label}</div>
                    <div className={`text-xs ${theme === t.id ? 'opacity-80' : 'text-[#A0A0A0]'}`}>
                      {t.description}
                    </div>
                  </div>
                  {theme === t.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Accent Color */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">Accent Color</h2>
          <div className="grid grid-cols-3 gap-3">
            {accentColors.map((color, index) => (
              <motion.button
                key={color.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAccentColorChange(color.color)}
                className={`relative p-4 rounded-2xl bg-gradient-to-br ${color.gradient} transition-all ${
                  accentColor === color.color ? 'ring-4 ring-[#F5F5F5] ring-offset-4 ring-offset-[#1A1A1A]' : ''
                }`}
              >
                <div className="aspect-square rounded-xl bg-[#1A1A1A]/20 mb-2" />
                <div className="text-sm font-bold text-[#1A1A1A]">{color.name}</div>
                {accentColor === color.color && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-[#F5F5F5]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">Preview</h2>
          <div className="bg-[#2A2A2A] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9F66] to-[#FF7733]" />
              <div className="flex-1">
                <div className="font-bold">PlayerMaker34</div>
                <div className="text-xs text-[#A0A0A0]">Online • Playing Overwatch</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-bold"
              style={{ backgroundColor: accentColor }}
            >
              <span className="text-[#1A1A1A]">Sample Button</span>
            </motion.button>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-[#3A3A3A] p-3 rounded-xl">
                <div className="text-2xl font-bold">156</div>
                <div className="text-xs text-[#A0A0A0]">Wins</div>
              </div>
              <div className="bg-[#3A3A3A] p-3 rounded-xl">
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-[#A0A0A0]">Groups</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Options */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">Display</h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-[#3A3A3A]">
              <div>
                <div className="font-medium">Compact Mode</div>
                <div className="text-xs text-[#A0A0A0]">Show more content at once</div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="relative w-14 h-8 rounded-full bg-[#3A3A3A]"
              >
                <div className="absolute top-1 left-1 w-6 h-6 bg-[#F5F5F5] rounded-full" />
              </motion.button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">Reduce Animations</div>
                <div className="text-xs text-[#A0A0A0]">Minimize motion effects</div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="relative w-14 h-8 rounded-full bg-[#3A3A3A]"
              >
                <div className="absolute top-1 left-1 w-6 h-6 bg-[#F5F5F5] rounded-full" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}