import { motion } from 'motion/react';
import { ArrowLeft, HelpCircle, Mail, MessageCircle, Book, Bug, ExternalLink } from 'lucide-react';
import { DiscordLogo, TwitterLogo, YoutubeLogo } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface HelpSupportScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function HelpSupportScreen({ onBack, onNavigate }: HelpSupportScreenProps) {
  const faqs = [
    {
      question: 'How do I join a group?',
      answer: 'Browse groups in the Groups tab or use the Discover feature to find groups that match your interests.'
    },
    {
      question: 'How do I add friends?',
      answer: 'You can add friends by scanning their QR code, searching for their username, or accepting friend requests.'
    },
    {
      question: 'Can I change my username?',
      answer: 'Yes! Go to Settings > Edit Profile to change your username and other profile information.'
    },
    {
      question: 'How do groups work?',
      answer: 'Groups let you organize gaming sessions, chat with members, and participate in events together.'
    }
  ];

  const supportOptions = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      action: () => toast.success('Opening email client...'),
      color: '#66BAFF'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with support team',
      action: () => toast.success('Starting live chat...'),
      color: '#66FF9F'
    },
    {
      icon: Book,
      title: 'Help Center',
      description: 'Browse help articles',
      action: () => toast.success('Opening help center...'),
      color: '#FF9F66'
    },
    {
      icon: Bug,
      title: 'Report a Bug',
      description: 'Help us improve',
      action: () => toast.success('Opening bug report form...'),
      color: '#FF6B6B'
    }
  ];

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
          <h1 className="text-2xl font-bold">Help & Support</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Help */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Get Help
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.title}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={option.action}
                  className="bg-[#2A2A2A] rounded-2xl p-4 text-left"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${option.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: option.color }} />
                  </div>
                  <div className="font-bold mb-1">{option.title}</div>
                  <div className="text-xs text-[#A0A0A0]">{option.description}</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="bg-[#2A2A2A] rounded-2xl p-4"
              >
                <div className="font-bold mb-2 flex items-start gap-2">
                  <span className="text-[#FF9F66] mt-1">Q:</span>
                  <span>{faq.question}</span>
                </div>
                <div className="text-sm text-[#A0A0A0] flex items-start gap-2">
                  <span className="text-[#66FF9F] mt-1">A:</span>
                  <span>{faq.answer}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Community */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">Community</h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            <motion.button
              whileHover={{ backgroundColor: '#3A3A3A' }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 flex items-center gap-3 border-b border-[#3A3A3A]"
            >
              <div className="w-10 h-10 rounded-full bg-[#5865F2]/20 flex items-center justify-center flex-shrink-0">
                <DiscordLogo size={22} weight="fill" className="text-[#5865F2]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Discord Community</div>
                <div className="text-xs text-[#A0A0A0]">Join our Discord server</div>
              </div>
              <ExternalLink className="w-5 h-5 text-[#A0A0A0]" />
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: '#3A3A3A' }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 flex items-center gap-3 border-b border-[#3A3A3A]"
            >
              <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/20 flex items-center justify-center flex-shrink-0">
                <TwitterLogo size={22} weight="fill" className="text-[#1DA1F2]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Twitter / X</div>
                <div className="text-xs text-[#A0A0A0]">Follow us for updates</div>
              </div>
              <ExternalLink className="w-5 h-5 text-[#A0A0A0]" />
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: '#3A3A3A' }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#FF0000]/20 flex items-center justify-center flex-shrink-0">
                <YoutubeLogo size={22} weight="fill" className="text-[#FF0000]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">YouTube</div>
                <div className="text-xs text-[#A0A0A0]">Watch tutorials and guides</div>
              </div>
              <ExternalLink className="w-5 h-5 text-[#A0A0A0]" />
            </motion.button>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">About Game Mate</h2>
          <div className="bg-[#2A2A2A] rounded-2xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF9F66] to-[#FF7733] mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Game Mate</h3>
            <p className="text-sm text-[#A0A0A0] mb-4">
              Connect with gamers, join groups, and organize gaming sessions together.
            </p>
            <div className="text-xs text-[#A0A0A0]">Version 1.0.0</div>
            <div className="text-xs text-[#A0A0A0]">© 2026 Game Mate. All rights reserved.</div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center text-sm text-[#A0A0A0]"
        >
          <p className="mb-2">Need more help?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toast.success('Opening email client...')}
            className="text-[#FF9F66] font-bold"
          >
            support@gamemate.com
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}