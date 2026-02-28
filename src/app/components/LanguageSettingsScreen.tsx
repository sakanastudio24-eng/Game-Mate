import { motion } from 'motion/react';
import { ArrowLeft, Globe, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface LanguageSettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function LanguageSettingsScreen({ onBack }: LanguageSettingsScreenProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', region: 'US' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'ES' },
    { code: 'fr', name: 'French', nativeName: 'Français', region: 'FR' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'DE' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'IT' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'PT' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'RU' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'JP' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'KR' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', region: 'CN' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'AR' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'IN' }
  ];

  const handleSelectLanguage = (code: string, name: string) => {
    setSelectedLanguage(code);
    toast.success(`Language changed to ${name}`, {
      description: 'App will restart to apply changes',
      duration: 2500
    });
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
          <h1 className="text-2xl font-bold">Language</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Info Banner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-[#66BAFF]/10 to-[#3498DB]/10 border border-[#66BAFF]/30 rounded-2xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-[#66BAFF] mt-0.5" />
            <div className="text-sm">
              <div className="font-bold mb-1 text-[#66BAFF]">App Language</div>
              <div className="text-[#A0A0A0]">
                Change the language used throughout Game Mate. The app will restart to apply your selection.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Language List */}
        <div className="space-y-2">
          {languages.map((language, index) => (
            <motion.button
              key={language.code}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02, backgroundColor: '#3A3A3A' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectLanguage(language.code, language.name)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                selectedLanguage === language.code
                  ? 'bg-gradient-to-r from-[#FF9F66] to-[#FF7733]'
                  : 'bg-[#2A2A2A]'
              }`}
            >
              {/* Region badge instead of emoji flag */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs tracking-wider ${
                selectedLanguage === language.code
                  ? 'bg-[#1A1A1A]/20 text-[#1A1A1A]'
                  : 'bg-[#3A3A3A] text-[#A0A0A0]'
              }`}>
                {language.region}
              </div>
              <div className="flex-1 text-left">
                <div className={`font-bold ${selectedLanguage === language.code ? 'text-[#1A1A1A]' : 'text-[#F5F5F5]'}`}>
                  {language.name}
                </div>
                <div className={`text-sm ${selectedLanguage === language.code ? 'text-[#1A1A1A]/70' : 'text-[#A0A0A0]'}`}>
                  {language.nativeName}
                </div>
              </div>
              {selectedLanguage === language.code && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center"
                >
                  <Check className="w-5 h-5 text-[#FF9F66]" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="text-sm text-[#A0A0A0] mb-3">
            Don't see your language?
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toast.success('Thank you for your interest!')}
            className="text-[#FF9F66] font-bold"
          >
            Request a Language
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}