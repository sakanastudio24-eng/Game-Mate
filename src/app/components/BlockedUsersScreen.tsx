import { motion } from 'motion/react';
import { ArrowLeft, UserX, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BlockedUsersScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function BlockedUsersScreen({ onBack }: BlockedUsersScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([
    {
      id: 1,
      username: 'ToxicPlayer99',
      avatar: 'https://images.unsplash.com/photo-1770795945584-6d5046ffe47c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200',
      blockedDate: 'Jan 15, 2026'
    },
    {
      id: 2,
      username: 'SpammerBot',
      avatar: 'https://images.unsplash.com/photo-1724260793422-7754e5d06fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200',
      blockedDate: 'Dec 20, 2025'
    }
  ]);

  const handleUnblock = (userId: number, username: string) => {
    setBlockedUsers(blockedUsers.filter(user => user.id !== userId));
    toast.success(`${username} unblocked`, {
      description: 'They can now interact with you again',
      duration: 2500
    });
  };

  const filteredUsers = blockedUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-12 h-12 bg-[#2A2A2A] rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-2xl font-bold">Blocked Users</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blocked users..."
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#FF9F66] transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 rounded-full bg-[#2A2A2A] mx-auto mb-4 flex items-center justify-center">
              {searchQuery ? (
                <Search className="w-12 h-12 text-[#A0A0A0]" />
              ) : (
                <UserX className="w-12 h-12 text-[#A0A0A0]" />
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">
              {searchQuery ? 'No Results' : 'No Blocked Users'}
            </h3>
            <p className="text-[#A0A0A0]">
              {searchQuery 
                ? 'Try searching with a different name'
                : 'Users you block will appear here'}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Info Banner */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-[#FF9F66]/10 border border-[#FF9F66]/30 rounded-2xl p-4 mb-6"
            >
              <div className="text-sm">
                <div className="font-bold mb-1">About Blocking</div>
                <div className="text-[#A0A0A0]">
                  Blocked users can't message you, see your profile, or invite you to groups.
                </div>
              </div>
            </motion.div>

            {/* Blocked Users List */}
            <div className="space-y-3">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#2A2A2A] rounded-2xl p-4 flex items-center gap-4"
                >
                  <div
                    className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#3A3A3A]"
                  >
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover grayscale opacity-60"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{user.username}</div>
                    <div className="text-xs text-[#A0A0A0]">Blocked on {user.blockedDate}</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUnblock(user.id, user.username)}
                    className="px-4 py-2 bg-[#3A3A3A] rounded-xl font-bold text-sm"
                  >
                    Unblock
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center text-sm text-[#A0A0A0]"
            >
              {blockedUsers.length} {blockedUsers.length === 1 ? 'user' : 'users'} blocked
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}