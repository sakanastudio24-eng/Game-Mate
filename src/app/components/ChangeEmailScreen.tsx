import { motion } from 'motion/react';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChangeEmailScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function ChangeEmailScreen({ onBack }: ChangeEmailScreenProps) {
  const [step, setStep] = useState<'verify' | 'new'>('verify');
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [code, setCode] = useState('');

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Please enter your password');
      return;
    }
    toast.success('Password verified!');
    setStep('new');
  };

  const handleChangeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    toast.success('Verification code sent!', {
      description: 'Check your new email inbox',
      duration: 3000
    });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    toast.success('Email changed successfully!', {
      description: 'Your email has been updated',
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
          <h1 className="text-2xl font-bold">Change Email</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-1 rounded-full ${step === 'verify' ? 'bg-[#FF9F66]' : 'bg-[#66FF9F]'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'new' ? 'bg-[#FF9F66]' : 'bg-[#2A2A2A]'}`} />
        </div>

        {step === 'verify' && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            {/* Current Email */}
            <div className="bg-[#2A2A2A] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-[#66BAFF]" />
                <span className="text-sm text-[#A0A0A0]">Current Email</span>
              </div>
              <div className="font-bold text-lg">playmaker@gamemate.com</div>
            </div>

            {/* Verify Password */}
            <form onSubmit={handleVerifyPassword}>
              <div className="bg-gradient-to-br from-[#FF9F66]/10 to-[#FF7733]/10 border border-[#FF9F66]/30 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <Shield className="w-5 h-5 text-[#FF9F66] mt-1" />
                  <div>
                    <div className="font-bold mb-1">Security Check</div>
                    <div className="text-sm text-[#A0A0A0]">
                      Please enter your password to continue
                    </div>
                  </div>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF9F66] transition-colors"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF9F66] to-[#FF7733] py-4 rounded-xl font-bold text-[#1A1A1A]"
              >
                Verify Password
              </motion.button>
            </form>
          </motion.div>
        )}

        {step === 'new' && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            {code ? (
              /* Verify Code Step */
              <form onSubmit={handleVerifyCode}>
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#66FF9F] to-[#2ECC71] mx-auto mb-4 flex items-center justify-center">
                    <Mail className="w-10 h-10 text-[#1A1A1A]" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Check Your Email</h2>
                  <p className="text-[#A0A0A0] text-sm">
                    We sent a verification code to<br />
                    <span className="text-[#F5F5F5] font-bold">{newEmail}</span>
                  </p>
                </div>

                <div className="bg-[#2A2A2A] rounded-2xl p-6 mb-6">
                  <label className="block text-sm text-[#A0A0A0] mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-[#66FF9F] transition-colors"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#66FF9F] to-[#2ECC71] py-4 rounded-xl font-bold text-[#1A1A1A] mb-3"
                >
                  Verify & Change Email
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => toast.success('Code resent!')}
                  className="w-full py-3 rounded-xl font-bold text-[#FF9F66]"
                >
                  Resend Code
                </motion.button>
              </form>
            ) : (
              /* New Email Step */
              <form onSubmit={handleChangeEmail}>
                <div className="bg-[#2A2A2A] rounded-2xl p-6 mb-6">
                  <label className="block text-sm text-[#A0A0A0] mb-2">New Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="newemail@example.com"
                    className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF9F66] transition-colors"
                  />
                </div>

                <div className="bg-[#FF9F66]/10 border border-[#FF9F66]/30 rounded-2xl p-4 mb-6">
                  <div className="text-sm text-[#F5F5F5]">
                    <div className="font-bold mb-2">What happens next:</div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-[#FF9F66]">•</span>
                        <span className="text-[#A0A0A0]">We'll send a verification code to your new email</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#FF9F66]">•</span>
                        <span className="text-[#A0A0A0]">Enter the code to complete the change</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#FF9F66]">•</span>
                        <span className="text-[#A0A0A0]">You'll need to log in with your new email</span>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#FF9F66] to-[#FF7733] py-4 rounded-xl font-bold text-[#1A1A1A]"
                >
                  Send Verification Code
                </motion.button>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}