import { motion } from 'motion/react';
import { ArrowLeft, Phone, Mail, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface VerifyPhoneScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function VerifyPhoneScreen({ onBack }: VerifyPhoneScreenProps) {
  /** Controls which step of the two-step flow is shown */
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  /** Raw phone number digits entered by the user */
  const [phoneNumber, setPhoneNumber] = useState('');
  /** 6-digit verification code entered by the user */
  const [code, setCode] = useState('');
  /** Selected international dial prefix */
  const [countryCode, setCountryCode] = useState('+1');

  /**
   * Validates the phone number length, shows a toast, and advances to the verify step.
   * In production: call SMS provider API here.
   * @param e - Form submit event
   */
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    toast.success('Verification code sent!', {
      description: 'Check your SMS messages',
      duration: 3000
    });
    setStep('verify');
  };

  /**
   * Validates the OTP code and shows success/error toast.
   * In production: verify the code against the SMS provider.
   * @param e - Form submit event
   */
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    toast.success('Phone verified successfully!', {
      description: 'Your phone number has been verified',
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
          <h1 className="text-2xl font-bold">Verify Phone</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-1 rounded-full ${step === 'phone' ? 'bg-[#FF9F66]' : 'bg-[#66FF9F]'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'verify' ? 'bg-[#FF9F66]' : 'bg-[#2A2A2A]'}`} />
        </div>

        {step === 'phone' ? (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            {/* Info */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#66BAFF] to-[#3498DB] mx-auto mb-4 flex items-center justify-center">
                <Phone className="w-10 h-10 text-[#1A1A1A]" />
              </div>
              <h2 className="text-xl font-bold mb-2">Add Phone Number</h2>
              <p className="text-[#A0A0A0] text-sm">
                Secure your account with two-factor authentication
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSendCode}>
              <div className="bg-[#2A2A2A] rounded-2xl p-6 mb-6">
                <label className="block text-sm text-[#A0A0A0] mb-3">Phone Number</label>
                <div className="flex gap-3">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF9F66] transition-colors"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+55">🇧🇷 +55</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="555 123 4567"
                    className="flex-1 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF9F66] transition-colors"
                  />
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-[#66FF9F]/10 border border-[#66FF9F]/30 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="w-5 h-5 text-[#66FF9F] mt-0.5" />
                  <div className="text-sm">
                    <div className="font-bold mb-1 text-[#66FF9F]">Why verify your phone?</div>
                    <div className="space-y-1 text-[#A0A0A0]">
                      <div>• Enhanced account security</div>
                      <div>• Two-factor authentication</div>
                      <div>• Account recovery option</div>
                      <div>• SMS notifications (optional)</div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-[#66BAFF] to-[#3498DB] py-4 rounded-xl font-bold text-[#1A1A1A]"
              >
                Send Verification Code
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            {/* Verify Code */}
            <form onSubmit={handleVerify}>
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#66FF9F] to-[#2ECC71] mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-10 h-10 text-[#1A1A1A]" />
                </div>
                <h2 className="text-xl font-bold mb-2">Check Your Phone</h2>
                <p className="text-[#A0A0A0] text-sm">
                  We sent a verification code to<br />
                  <span className="text-[#F5F5F5] font-bold">{countryCode} {phoneNumber}</span>
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
                Verify Phone Number
              </motion.button>

              <div className="flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => toast.success('Code resent!')}
                  className="text-[#FF9F66] font-bold text-sm"
                >
                  Resend Code
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-[#A0A0A0] font-bold text-sm"
                >
                  Change Number
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}