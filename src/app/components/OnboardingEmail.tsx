import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Mail } from 'lucide-react';

/**
 * @component OnboardingEmail
 * @description Onboarding step 1 of 3. Collects the user's email address.
 * Validates format with a simple '@' check before enabling the Next button.
 * Optional marketing email opt-in toggle (does not block progression).
 *
 * Progress indicator: 1 of 3 bars filled (orange).
 *
 * @param onNext - Called when a valid email is entered and the user taps Next
 * @iosEquivalent OnboardingEmailView.swift with TextField + .keyboardType(.emailAddress)
 * @see docs/FLOWS.md — Onboarding Flow
 */
interface OnboardingEmailProps {
  onNext: () => void;
}

export function OnboardingEmail({ onNext }: OnboardingEmailProps) {
  /** Controlled email input value */
  const [email, setEmail] = useState('');
  /** Whether the user has opted in to marketing/newsletter emails */
  const [acceptEmails, setAcceptEmails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#F5F5F5] flex flex-col p-8"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <p className="text-[#A0A0A0] text-sm mb-4">Welcome to Game Mate</p>
        <h2 className="text-[#1A1A1A] text-4xl font-bold">Create Account</h2>
      </motion.div>

      <div className="flex-1">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-6 h-6 text-[#FF9F66]" />
            <h3 className="text-[#1A1A1A] text-2xl font-bold">What's Your Email?</h3>
          </div>
          <p className="text-[#A0A0A0] mb-4">We'll use this to keep your account secure</p>
          <div className="flex gap-2 mb-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="h-1 bg-[#FF9F66] rounded-full"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="h-1 bg-[#D0D0D0] rounded-full"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="h-1 bg-[#D0D0D0] rounded-full"
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <label className="block text-[#1A1A1A] text-xs font-bold mb-3 uppercase tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gamer@example.com"
              className="w-full bg-[#E8E8E8] text-[#1A1A1A] px-6 py-4 rounded-2xl placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FF9F66] transition-all"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: email.includes('@') ? 1 : 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#66FF9F] rounded-full flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        <motion.label
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-start gap-3 cursor-pointer group"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                acceptEmails ? 'bg-[#FF9F66]' : 'bg-[#D0D0D0] group-hover:bg-[#C0C0C0]'
              }`}
              onClick={() => setAcceptEmails(!acceptEmails)}
            >
              <motion.div
                initial={false}
                animate={{ scale: acceptEmails ? 1 : 0, rotate: acceptEmails ? 0 : -180 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
          <span className="text-[#1A1A1A] pt-3 leading-relaxed">
            Send me updates about Game Mate features and gaming news
          </span>
        </motion.label>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          disabled={!email.includes('@')}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
            email.includes('@')
              ? 'bg-gradient-to-br from-[#FF9F66] to-[#FF7733]'
              : 'bg-[#D0D0D0] opacity-50'
          }`}
        >
          <ChevronRight className="w-10 h-10 text-[#1A1A1A]" strokeWidth={3} />
        </motion.button>
        <p className="text-[#A0A0A0] text-sm">already have an account?</p>
      </motion.div>
    </motion.div>
  );
}