import { motion } from 'motion/react';
import { ArrowLeft, Send, Smile, ImageIcon, Mic, MoreVertical, Phone, Video } from 'lucide-react';
import { useState } from 'react';

interface ChatScreenProps {
  user: any;
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

const FRIEND_AVATARS: Record<string, string> = {
  PlayerHater: 'https://images.unsplash.com/photo-1642792247757-c212e8ba9af9?w=200&h=200&fit=crop',
  PlayerLover: 'https://images.unsplash.com/photo-1572704764530-5b5da1f5a973?w=200&h=200&fit=crop',
  GamerPro: 'https://images.unsplash.com/photo-1759701546655-d90ec831aa52?w=200&h=200&fit=crop',
  PlayerKiller: 'https://images.unsplash.com/photo-1599220274056-a6cdbe06c2c0?w=200&h=200&fit=crop',
  NoobMaster: 'https://images.unsplash.com/photo-1633286464918-4d78c8424b59?w=200&h=200&fit=crop',
};

export function ChatScreen({ user, onBack, onNavigate }: ChatScreenProps) {
  /** Controlled value for the message input field */
  const [message, setMessage] = useState('');
  /** Local message history — seed data simulates a pre-existing conversation */
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hey! Want to queue up for some Overwatch?', sent: false, time: '10:23 AM', read: true },
    { id: 2, text: 'Sure! I just need 5 minutes', sent: true, time: '10:24 AM', read: true },
    { id: 3, text: 'No problem, take your time', sent: false, time: '10:24 AM', read: true },
    { id: 4, text: 'Ready! Let\'s do this', sent: true, time: '10:30 AM', read: true },
    { id: 5, text: 'Perfect! I\'ll create the lobby', sent: false, time: '10:30 AM', read: false }
  ]);

  /** Resolved friend username — falls back to 'PlayerHater' if user prop is undefined */
  const userName = user?.user || 'PlayerHater';
  /** Resolved avatar URL from the static lookup map */
  const avatarUrl = FRIEND_AVATARS[userName] || FRIEND_AVATARS.PlayerHater;

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        text: message,
        sent: true,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        read: false
      }]);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5] flex flex-col"
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-[#1A1A1A]/95 backdrop-blur-lg border-b border-[#2A2A2A]">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-10 h-10 bg-[#242424] rounded-full flex items-center justify-center border border-[#333]"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('user-profile', user)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#FF9F66]"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ADE80] rounded-full border-2 border-[#1A1A1A]"
                />
              </div>
              <div>
                <h2 className="font-bold leading-none mb-0.5">{userName}</h2>
                <p className="text-xs text-[#4ADE80]">Online now</p>
              </div>
            </motion.div>
          </div>

          <div className="flex gap-2">
            {[Phone, Video, MoreVertical].map((Icon, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-[#242424] rounded-full flex items-center justify-center border border-[#333]"
              >
                <Icon className="w-4 h-4" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.04 }}
              className={`flex items-end gap-2 ${msg.sent ? 'justify-end' : 'justify-start'}`}
            >
              {!msg.sent && (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mb-1 border border-[#333]"
                />
              )}
              <div className={`max-w-[72%]`}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`rounded-2xl px-4 py-3 ${
                    msg.sent
                      ? 'bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A] rounded-br-sm'
                      : 'bg-[#242424] text-[#F5F5F5] rounded-bl-sm border border-[#333]'
                  }`}
                >
                  <p className="text-sm break-words">{msg.text}</p>
                </motion.div>
                <div className={`flex items-center gap-1 mt-1 px-1 ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-[#606060]">{msg.time}</span>
                  {msg.sent && (
                    <span className="text-xs text-[#606060]">{msg.read ? '·· read' : '· sent'}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="flex items-end gap-2 justify-start"
        >
          <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#333]" />
          <div className="bg-[#242424] rounded-2xl rounded-bl-sm px-4 py-3 border border-[#333]">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 bg-[#A0A0A0] rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-[#1A1A1A] border-t border-[#2A2A2A] p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-[#242424] border border-[#333] rounded-3xl px-4 py-3 flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-[#606060]">
              <Smile className="w-5 h-5" />
            </motion.button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent focus:outline-none text-sm"
            />
            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-[#606060]">
                <ImageIcon className="w-5 h-5" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-[#606060]">
                <Mic className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!message.trim()}
            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              message.trim() ? 'bg-gradient-to-r from-[#FF9F66] to-[#FF7733]' : 'bg-[#242424] border border-[#333]'
            }`}
          >
            <Send className={`w-5 h-5 ${message.trim() ? 'text-[#1A1A1A]' : 'text-[#606060]'}`} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}