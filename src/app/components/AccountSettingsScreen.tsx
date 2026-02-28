import { motion } from 'motion/react';
import { ArrowLeft, Mail, Phone, Key, Trash2, Shield, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AccountSettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function AccountSettingsScreen({ onBack, onNavigate }: AccountSettingsScreenProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleChangeEmail = () => {
    onNavigate('change-email');
  };

  const handleChangePassword = () => {
    onNavigate('change-password');
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(twoFactorEnabled ? '2FA disabled' : '2FA enabled!', {
      duration: 2000
    });
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requested', {
      description: 'Please check your email to confirm',
      duration: 3000
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
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Email Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">Email Address</h2>
          <div className="bg-[#2A2A2A] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-[#FF9F66]" />
              <div className="flex-1">
                <div className="font-bold">playmaker@gamemate.com</div>
                <div className="text-xs text-[#66FF9F] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleChangeEmail}
              className="w-full bg-[#3A3A3A] py-3 rounded-xl font-bold"
            >
              Change Email
            </motion.button>
          </div>
        </motion.div>

        {/* Phone Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">Phone Number</h2>
          <div className="bg-[#2A2A2A] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-5 h-5 text-[#66BAFF]" />
              <div className="flex-1">
                <div className="font-bold">+1 (555) 123-4567</div>
                <div className="text-xs text-[#A0A0A0]">Not verified</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('verify-phone')}
              className="w-full bg-[#3A3A3A] py-3 rounded-xl font-bold"
            >
              Verify Phone
            </motion.button>
          </div>
        </motion.div>

        {/* Password Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">Password & Security</h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            <motion.button
              whileHover={{ backgroundColor: '#3A3A3A' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleChangePassword}
              className="w-full p-4 flex items-center gap-3 border-b border-[#3A3A3A]"
            >
              <Key className="w-5 h-5 text-[#FF9F66]" />
              <span className="flex-1 text-left font-medium">Change Password</span>
              <span className="text-xs text-[#A0A0A0]">Last changed 3 months ago</span>
            </motion.button>
            
            <div className="p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#66FF9F]" />
              <div className="flex-1">
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-xs text-[#A0A0A0]">Add extra security to your account</div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleToggle2FA}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-[#66FF9F]' : 'bg-[#3A3A3A]'
                }`}
              >
                <motion.div
                  animate={{ x: twoFactorEnabled ? 24 : 2 }}
                  className="absolute top-1 w-6 h-6 bg-[#F5F5F5] rounded-full"
                />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Connected Accounts */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">Connected Accounts</h2>
          <div className="bg-[#2A2A2A] rounded-2xl overflow-hidden">
            {[
              { name: 'Discord', connected: true, icon: 'discord' },
              { name: 'Steam', connected: true, icon: 'steam' },
              { name: 'Twitch', connected: false, icon: 'twitch' },
              { name: 'Epic Games', connected: false, icon: 'epic' }
            ].map((account, index) => (
              <div
                key={account.name}
                className={`p-4 flex items-center gap-3 ${
                  index !== 3 ? 'border-b border-[#3A3A3A]' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#3A3A3A] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#A0A0A0]">{account.name.slice(0,2)}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{account.name}</div>
                  <div className={`text-xs flex items-center gap-1 ${account.connected ? 'text-[#66FF9F]' : 'text-[#A0A0A0]'}`}>
                    {account.connected && <CheckCircle className="w-3 h-3" />}
                    {account.connected ? 'Connected' : 'Not connected'}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full font-bold text-sm ${
                    account.connected
                      ? 'bg-[#3A3A3A] text-[#F5F5F5]'
                      : 'bg-[#FF9F66] text-[#1A1A1A]'
                  }`}
                >
                  {account.connected ? 'Disconnect' : 'Connect'}
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Download Data */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-sm font-bold text-[#A0A0A0] mb-3 uppercase">Data & Privacy</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success('Data export started!')}
            className="w-full bg-[#2A2A2A] p-4 rounded-2xl flex items-center gap-3"
          >
            <LinkIcon className="w-5 h-5 text-[#66BAFF]" />
            <div className="flex-1 text-left">
              <div className="font-medium">Download Your Data</div>
              <div className="text-xs text-[#A0A0A0]">Get a copy of your Game Mate data</div>
            </div>
          </motion.button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-sm font-bold text-[#FF6B6B] mb-3 uppercase">Danger Zone</h2>
          <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-4">
              <Trash2 className="w-5 h-5 text-[#FF6B6B] mt-1" />
              <div className="flex-1">
                <div className="font-bold text-[#FF6B6B]">Delete Account</div>
                <div className="text-sm text-[#F5F5F5] mt-1">
                  Once you delete your account, there is no going back. Please be certain.
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteAccount}
              className="w-full bg-[#FF6B6B] text-[#F5F5F5] py-3 rounded-xl font-bold"
            >
              Delete My Account
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}