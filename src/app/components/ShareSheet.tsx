import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Copy, MessageSquare, QrCode, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    title: string;
    type: 'post' | 'group' | 'profile';
    url?: string;
  };
}

export function ShareSheet({ isOpen, onClose, content }: ShareSheetProps) {
  const shareOptions = [
    {
      id: 'message',
      label: 'Send Message',
      icon: MessageSquare,
      color: '#66BAFF',
      action: () => {
        toast.success('Opening messages...');
        onClose();
      }
    },
    {
      id: 'qr',
      label: 'Share QR Code',
      icon: QrCode,
      color: '#FF9F66',
      action: () => {
        toast.success('Opening QR code...');
        onClose();
      }
    },
    {
      id: 'copy',
      label: 'Copy Link',
      icon: Copy,
      color: '#66FF9F',
      action: () => {
        navigator.clipboard.writeText(content.url || 'https://gamemate.app/share');
        toast.success('Link copied to clipboard!');
        onClose();
      }
    },
    {
      id: 'link',
      label: 'Share Link',
      icon: LinkIcon,
      color: '#FF66BA',
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: content.title,
            url: content.url || 'https://gamemate.app/share'
          });
        } else {
          toast.success('Sharing...', { duration: 1500 });
        }
        onClose();
      }
    }
  ];

  const friends = [
    { id: 1, name: 'PlayerHater', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80', online: true },
    { id: 2, name: 'PlayerLover', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', online: true },
    { id: 3, name: 'GamerPro', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80', online: true },
    { id: 4, name: 'PlayerKiller', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', online: false },
    { id: 5, name: 'NoobMaster', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', online: true }
  ];

  const handleShareToFriend = (friend: any) => {
    toast.success(`Shared with ${friend.name}!`, {
      duration: 2000
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-3xl z-50 max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-[#3A3A3A] rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Share</h2>
                <p className="text-sm text-[#A0A0A0]">{content.title}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Share Options */}
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Share via</h3>
                <div className="grid grid-cols-4 gap-4">
                  {shareOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={option.action}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: `${option.color}20` }}
                        >
                          <Icon className="w-7 h-7" style={{ color: option.color }} />
                        </div>
                        <span className="text-xs text-center">{option.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Friends */}
              <div className="px-6 pb-6">
                <h3 className="text-lg font-bold mb-4">Send to friends</h3>
                <div className="space-y-3">
                  {friends.map((friend, index) => (
                    <motion.div
                      key={friend.id}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleShareToFriend(friend)}
                      className="bg-[#2A2A2A] rounded-2xl p-3 flex items-center gap-3 cursor-pointer"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                        </div>
                        {friend.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#66FF9F] rounded-full border-2 border-[#2A2A2A]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">{friend.name}</h4>
                        <p className="text-xs text-[#A0A0A0]">
                          {friend.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-[#FF9F66] rounded-full flex items-center justify-center"
                      >
                        <Share2 className="w-5 h-5 text-[#1A1A1A]" />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}