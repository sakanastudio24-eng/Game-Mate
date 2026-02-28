import { motion } from 'motion/react';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChangePasswordScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function ChangePasswordScreen({ onBack }: ChangePasswordScreenProps) {
  /** The user's current/existing password */
  const [currentPassword, setCurrentPassword] = useState('');
  /** The desired new password — also drives the strength meter */
  const [newPassword, setNewPassword] = useState('');
  /** Confirmation field — must exactly match newPassword */
  const [confirmPassword, setConfirmPassword] = useState('');
  /** Visibility toggle for current password field */
  const [showCurrent, setShowCurrent] = useState(false);
  /** Visibility toggle for new password field */
  const [showNew, setShowNew] = useState(false);
  /** Visibility toggle for confirm password field */
  const [showConfirm, setShowConfirm] = useState(false);

  /**
   * Computes password strength based on length and character variety.
   * @param password - The new password string being evaluated
   * @returns An object with `label` (display text), `strength` (0–4 scale), and `color` (hex)
   */
  const passwordStrength = (password: string) => {
    if (password.length === 0) return { label: '', strength: 0, color: '' };
    if (password.length < 6) return { label: 'Weak', strength: 1, color: '#FF6B6B' };
    if (password.length < 10) return { label: 'Fair', strength: 2, color: '#FF9F66' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { label: 'Good', strength: 3, color: '#66FF9F' };
    return { label: 'Strong', strength: 4, color: '#66FF9F' };
  };

  const strength = passwordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      toast.error('New password must be different');
      return;
    }

    toast.success('Password changed successfully!', {
      description: 'Your password has been updated',
      duration: 3000
    });
    setTimeout(() => onBack(), 1500);
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
          <h1 className="text-2xl font-bold">Change Password</h1>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-bold text-[#A0A0A0] mb-2 uppercase">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl pl-12 pr-12 py-4 focus:outline-none focus:border-[#FF9F66] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]"
              >
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>

          {/* New Password */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-bold text-[#A0A0A0] mb-2 uppercase">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl pl-12 pr-12 py-4 focus:outline-none focus:border-[#FF9F66] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]"
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength */}
            {newPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{
                          backgroundColor: level <= strength.strength ? strength.color : '#3A3A3A'
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
                <div className="text-xs text-[#A0A0A0] space-y-1">
                  <div className={newPassword.length >= 8 ? 'text-[#66FF9F]' : ''}>
                    {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                  </div>
                  <div className={/[A-Z]/.test(newPassword) ? 'text-[#66FF9F]' : ''}>
                    {/[A-Z]/.test(newPassword) ? '✓' : '○'} One uppercase letter
                  </div>
                  <div className={/[a-z]/.test(newPassword) ? 'text-[#66FF9F]' : ''}>
                    {/[a-z]/.test(newPassword) ? '✓' : '○'} One lowercase letter
                  </div>
                  <div className={/\d/.test(newPassword) ? 'text-[#66FF9F]' : ''}>
                    {/\d/.test(newPassword) ? '✓' : '○'} One number
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-bold text-[#A0A0A0] mb-2 uppercase">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl pl-12 pr-12 py-4 focus:outline-none focus:border-[#FF9F66] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-[#FF6B6B] mt-2"
              >
                Passwords do not match
              </motion.div>
            )}
            {confirmPassword && confirmPassword === newPassword && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-[#66FF9F] mt-2"
              >
                ✓ Passwords match
              </motion.div>
            )}
          </motion.div>

          {/* Security Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#66BAFF]/10 border border-[#66BAFF]/30 rounded-2xl p-4"
          >
            <div className="text-sm">
              <div className="font-bold mb-2 text-[#66BAFF]">💡 Security Tips</div>
              <div className="space-y-1 text-[#A0A0A0]">
                <div>• Use a unique password you haven't used before</div>
                <div>• Mix uppercase, lowercase, numbers, and symbols</div>
                <div>• Avoid personal information like birthdays</div>
                <div>• Consider using a password manager</div>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF9F66] to-[#FF7733] py-4 rounded-xl font-bold text-[#1A1A1A]"
          >
            Change Password
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}